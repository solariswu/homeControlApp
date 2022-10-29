import React, {useEffect, useState} from 'react';
import {LOCATION, KEY, WEATHER_URI, WEATHER_FILENAME} from '../const';
import Sound from 'react-native-sound';

import {Text} from 'react-native';

let AWS = require('aws-sdk/dist/aws-sdk-react-native');
let axios = require('axios');
let polly = new AWS.Polly({region: 'ap-southeast-2'});
let s3 = new AWS.S3({region: 'ap-southeast-2'});
let RNFS = require('react-native-fs');

const BASEPATH = RNFS.DocumentDirectoryPath;

const saveMp3file = async (fileName, audioStream) => {
  // create a path you want to write to
  // :warning: on iOS, you cannot write into `RNFS.MainBundlePath`,
  // but `RNFS.DocumentDirectoryPath` exists on both platforms and is writable
  const toFile = `${BASEPATH}/${fileName}.mp3`;

  // write the file
  return RNFS.writeFile(toFile, audioStream.toString('base64'), 'base64')
};

const weatherNowJsonToText = nowData => {
  return `现在室外温度为${nowData.temp}摄氏度，${nowData.text}，${nowData.windDir},风力${nowData.windScale}级。`;
};

const weatherTodayJsonToText = todayData => {
  return `今天天气${todayData.textDay}，最高温度${todayData.tempMax}摄氏度，最低气温${todayData.tempMin}摄氏度，紫外线指数${todayData.uvIndex}。`;
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
      let now = new Date();
      var month = now.getMonth() + 1;
      var date = now.getDate();
      var hour = now.getHours();
      var minutes = now.getMinutes();
      if (minutes < 10) {
        minutes = '0' + minutes;
      }

      let text = `${month}月${date}日${hour}点${minutes}分。`;
      text += weatherNowJsonToText(res[0].data.now);
      text += weatherTodayJsonToText(res[1].data.daily[0]);

      const pollyParams = {
        OutputFormat: 'mp3',
        LanguageCode: 'cmn-CN',
        Text: text,
        VoiceId: 'Zhiyu',
      };
      return polly.synthesizeSpeech(pollyParams).promise();
    })
    .then(data => {
      return saveMp3file(WEATHER_FILENAME, data.AudioStream);
    })
    .then(() => {
      console.log('start new sound', `${WEATHER_FILENAME}.mp3`);
      const newSound = new Sound(
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
          const currentSound = newSound.play(success => {
            if (!success) {
              console.error('unable to play Sound');
            } else {
              console.log('finish playing weather now');
            }
            getMemoFile()
            .then (file => {
              readText();
            })
          });
        },
      );
    })
    .catch(error => console.error('polly error:', error));
};

const getMemoFile = async () => {
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

const readText = async () => {
  const uri = `${BASEPATH}/memo2.mp3`;

  let textSound = new Sound(
    uri,
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

export const Weather = props => {
  const [weatherText, setweatherText] = useState(null);

  useEffect(() => {
    getAndPlayWeather(LOCATION, KEY);
  }, []);

  return <Text>Hello, I am weather</Text>;
};
