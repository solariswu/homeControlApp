import React, {memo, useEffect, useState} from 'react';
import {
  LOCATION,
  KEY,
  WEATHER_URI,
  WEATHER_FILENAME,
  MEMO_FILENAME,
} from '../const';
import Sound from 'react-native-sound';

import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

let AWS = require('aws-sdk/dist/aws-sdk-react-native');
let axios = require('axios');
let polly = new AWS.Polly({region: 'ap-southeast-2'});
let s3 = new AWS.S3({region: 'ap-southeast-2'});
let RNFS = require('react-native-fs');

const BASEPATH = RNFS.DocumentDirectoryPath;
export const Memo = ({setMode}) => {
  const [weatherText, setWeatherText] = useState(null);
  const [fixMemoText, setFixMemoText] = useState(null);
  const [varMemoText, setVarMemoText] = useState(null);

  const saveMp3file = async (fileName, audioStream) => {
    // create a path you want to write to
    // :warning: on iOS, you cannot write into `RNFS.MainBundlePath`,
    // but `RNFS.DocumentDirectoryPath` exists on both platforms and is writable
    const toFile = `${BASEPATH}/${fileName}.mp3`;

    // write the file
    return RNFS.writeFile(toFile, audioStream.toString('base64'), 'base64');
  };

  const weatherNowJsonToText = nowData => {
    return `现在室外温度为${nowData.temp}摄氏度，\
${nowData.text}，${nowData.windDir}，\
风力${nowData.windScale}级。`;
  };

  const weatherTodayJsonToText = todayData => {
    return `今天天气${todayData.textDay}，\
最高温度${todayData.tempMax}摄氏度，\
最低气温${todayData.tempMin}摄氏度，\
紫外线指数${todayData.uvIndex}。`;
  };

  const fetchMemoText = async () => {
    const fixMemoUri = s3.getSignedUrl('getObject', {
      Bucket: 'mypollytalk',
      Key: 'fixMemo.txt',
    });

    const varMemoUri = s3.getSignedUrl('getObject', {
      Bucket: 'mypollytalk',
      Key: 'varMemo.txt',
    });

    axios
      .get(fixMemoUri)
      .then(resMemo => setFixMemoText(resMemo.data))
      .catch(error => console.error(error));

    axios
      .get(varMemoUri)
      .then(data => setVarMemoText(data.data))
      .catch(error => console.error(error));
  };

  const downloadMemoMp3File = async () => {
    const toFile = `${BASEPATH}/memo2.mp3`;
    const fromUrl = s3.getSignedUrl('getObject', {
      Bucket: 'mypollytalk',
      Key: 'memo.mp3',
    });

    deleteFile(toFile);

    const progress = data => {
      const percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
      const text = `Progress ${percentage}%`;
      console.log('Downloading -', text);
    };

    const downloadOption = {
      fromUrl, // URL to download file from
      toFile, // Local filesystem path to save the file to
      begin: res => {
        console.log('download started:', res);
      },
      progressDivider: 1,
      progress,
    };

    return RNFS.downloadFile(downloadOption).promise;
  };

  const deleteFile = async path => {
    return (
      RNFS.unlink(path)
        .then(() => {
          console.log('FILE DELETED');
        })
        // `unlink` will throw an error, if the item to unlink does not exist
        .catch(err => {
          console.log(err.message);
        })
    );
  };

  const playMp3File = async fileUri => {
    // const uri = `${BASEPATH}/memo2.mp3`;
    let textSound = new Sound(
      fileUri,
      '', //Sound.MAIN_BUNDLE,
      (error, _sound) => {
        if (error) {
          alert('error' + error.message);
          return;
        }
        textSound.play(() => {
          textSound.release();
        });
      },
    );
  };

  const DATEINFO = () => {
    const dayArray = ['日', '一', '二', '三', '四', '五', '六'];

    let now = new Date();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var day = now.getDay();
    // var hour = now.getHours();
    // var minutes = now.getMinutes();
    // if (minutes < 10) {
    //   minutes = '0' + minutes;
    // }

    const dateText = `${month}月${date}日 星期${dayArray[day]}`;
    return <Text>{dateText}</Text>;
  };
  const getAndPlayWeather = (location, key) => {
    const promises = [];
    promises.push(
      axios.get(`${WEATHER_URI}/now`, {
        params: {location, key},
      }),
    );
    promises.push(
      axios.get(`${WEATHER_URI}/3d`, {
        params: {location, key},
      }),
    );

    Promise.all(promises)
      .then(res => {
        const weatherText =
          weatherNowJsonToText(res[0].data.now) +
          '\n' +
          weatherTodayJsonToText(res[1].data.daily[0]);

        setWeatherText(weatherText);

        const pollyParams = {
          OutputFormat: 'mp3',
          LanguageCode: 'cmn-CN',
          Text: weatherText,
          VoiceId: 'Zhiyu',
        };
        // temp comment for saving polly test
        // return polly.synthesizeSpeech(pollyParams).promise();
        // })
        // .then(data => {
        //   return saveMp3file(WEATHER_FILENAME, data.AudioStream);
      })
      .then(() => {
        console.log('start new sound', `${WEATHER_FILENAME}.mp3`);
        const weatherSnd = new Sound(
          `${BASEPATH}/${WEATHER_FILENAME}.mp3`,
          '', //Sound.MAIN_BUNDLE,
          (error, _sound) => {
            if (error) {
              console.error('error on loading Sound', error);
              return;
            }

            //   if (currentSound && currentSound.current) {
            // 	currentSound.current.release();
            //   }
            const currentSound = weatherSnd.play(success => {
              if (!success) {
                console.error('unable to play Sound');
              } else {
                console.log('finish playing weather now');
              }
              downloadMemoMp3File().then(() => {
                playMp3File(`${BASEPATH}/${MEMO_FILENAME}.mp3`);
              });
            });
          },
        );
      })
      .catch(error => console.error('polly error:', error));
  };

  useEffect(() => {
    fetchMemoText();
    getAndPlayWeather(LOCATION, KEY);
  }, []);

  const MEMOLIST = ({memoText}) => {
    if (memoText !== null) {
      const memos = memoText.split('\n').filter(memo => memo.length > 0);

      if (memos.length > 0) {
        return memos.map((memo, index) => {
          return (
            <View key={index} style={[styles.outerHeight]}>
              <View style={[styles.underline, styles.inOneLine]}>
                <TouchableOpacity style={[styles.icon]} />
                <Text style={[styles.text]}>{memo}</Text>
              </View>
            </View>
          );
        });
      }
    }
  };

  const onPress = () => {setMode('home')};

  return (
    <View style={[styles.container]}>
      <TouchableOpacity style={[styles.backButton]} onPress={onPress}>
        <Text style={[styles.text]}> &lt; Back</Text>
      </TouchableOpacity>
      <Text style={[styles.text]}>
        <DATEINFO />
      </Text>
      <View style={[styles.memo, styles.memoColorOne]}>
        <Text style={[styles.text]}>{weatherText}</Text>
      </View>
      <View style={[styles.memo, styles.memoColorTwo]}>
        <MEMOLIST memoText={fixMemoText} />
      </View>
      <View style={[styles.memo, styles.memoColorThree]}>
        <MEMOLIST memoText={varMemoText} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignContent: 'center',
    padding: 10,
    backgroundColor: '#E6DEDC',
    height: '100%',
  },
  backButton: {
    marginTop: 40,
    marginBottom: 50,
    alignItems: 'flex-start',
  },
  memo: {
    flexDirection: 'column',
    margin: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#777777',
    shadowColor: '#666666',
  },
  memoColorOne: {
    backgroundColor: '#D6E1D7',
  },
  memoColorTwo: {
    backgroundColor: '#E7D4B5',
  },
  memoColorThree: {
    backgroundColor: '#DBD4C6',
  },
  text: {
    color: '#8E9AAB',
    fontWeight: 'bold',
    fontSize: 28,
    padding: 10,
  },
  outerHeight: {
    padding: 8,
  },
  inOneLine: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: '#8E9AAB',
  },
  icon: {
    width: 20,
    height: 20,
    margin: 15,
    borderWidth: 1,
    borderColor: '#8E9AAB',
    borderRadius: 2,
  },
});
