import React, {useEffect, useReducer, useRef, useState} from 'react';
import {
  Animated,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';

import Sound from 'react-native-sound';
import {pwd} from '../const';

import {shuffleArray} from '../utils';

const githubRawAssetsPath =
  'https://raw.githubusercontent.com/solariswu/musicstore/master/assets/';

const sndFiles = [
  '001.mp3',
  '002.mp3',
  '003.mp3',
  '004.mp3',
  '005.mp3',
  '006.mp3',
  '007.mp3',
  '008.mp3',
  '009.mp3',
];

const soundFiles = shuffleArray(sndFiles);

const ENTRY_SOUND = 'welcome.mp3';

const nasRestPrefix = 'http://192.168.20.15:5000/webapi/entry.cgi';

const nasImgPath = '/homes/clientcredential/imgs/';
const nasThumbImgAPI =
  '?api=SYNO.FileStation.Thumb&version=2&method=get&size=large';
const nasListFileAPI = '?api=SYNO.FileStation.List&version=2&method=list';

const nasSidQstring = '&_sid=';
const nasPathQstring = '&path=';
const nasListFilesParams = '&folder_path=';

export const ImageLoader = props => {
  const [sid, setSid] = useState('');
  const [state, dispatch] = useReducer(reducer, {
    imgDispCount: 0,
    timeCount: 14 * 60 + 55,
  });
  const [count, setCount] = useState(0);
  const [currentTrackName, setCurrentTrackName] = useState(ENTRY_SOUND);
  const currentSound = useRef(null);

  const getImgFileUrl = (files, index, sid) => {
    const imgURL =
      nasRestPrefix +
      nasThumbImgAPI +
      nasPathQstring +
      nasImgPath +
      files[index].name +
      nasSidQstring +
      sid;
    return imgURL;
  };

  const getFileListFromNas = async (filePath, sid) => {
    let files = [];
    const nasURL =
      nasRestPrefix +
      nasListFileAPI +
      nasSidQstring +
      sid +
      nasListFilesParams +
      filePath;

    try {
      const response = await fetch(nasURL);
      const json = await response.json();
      files = json.data.files;
    } catch (error) {
      console.error(error);
    }

    return files;
  };

  const loadImgFilesFromNAS = async () => {
    try {
      const sidUri =
        'http://192.168.20.15:5000/webapi/entry.cgi?api=SYNO.API.Auth&version=7&method=login&account=clientcredential&passwd=' +
        pwd +
        '&format=sid&session=FileStation';

      const response = await fetch(sidUri);
      const json = await response.json();
      setSid(json.data.sid);
      const files = await getFileListFromNas(
        '/homes/clientcredential/imgs',
        json.data.sid,
      );
      if (files.length > 0) {
        dispatch({
          type: 'setImage',
          payload: files.sort(() => Math.random() - 0.5),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const initState = {
    imgDispCount: 0,
    imgFiles: [],
  };

  function reducer(state = initState, action) {
    switch (action.type) {
      case 'count':
        if (state.timeCount < (state.imgDispCount + 1) * 5) {
          props.setMode('home');
          return; // initState;
        }
        if (state && state.imgFiles && state.imgFiles.length > 1)
          return {
            ...state,
            imgDispCount: state.imgDispCount + 1,
          };
        return state;
      case 'setImage':
        return {...state, imgFiles: action.payload};
      case 'addTen':
        return {...state, timeCount: state.timeCount + 600};
      case 'minusTen':
        return {
          ...state,
          timeCount: state.timeCount > 600 ? state.timeCount - 600 : 10,
        };
      default:
        break;
    }
  }

  const secondToDate = result => {
    var h = Math.floor(result / 3600);
    var m = Math.floor((result / 60) % 60);
    var s = Math.floor(result % 60);

    if (result < 0) return '00:00';

    result = h > 0 ? h + ':' : '';
    result = result + (m > 9 ? '' : '0');
    return (result = result + m + ':' + (s < 10 ? `0${s}` : s));
  };

  useEffect(() => {
    console.log('currentTrackName:', currentTrackName);
    try {
      const newSound = new Sound(
        githubRawAssetsPath + currentTrackName,
        '', //Sound.MAIN_BUNDLE,
        (error, _sound) => {
          if (error) {
            console.error;
            'error on loading Sound', error;
            return;
          }
          if (currentSound && currentSound.current) {
            currentSound.current.release();
          }
          currentSound.current = newSound.play(success => {
            if (!success) {
              console.error('unable to play Sound');
            } else {
              setCount(count => count + 1);
              const sndFileIdx = (count + 1) % soundFiles.length;
              if (sndFileIdx === 0) {
                shuffleArray(soundFiles);
              }
              setCurrentTrackName(soundFiles[sndFileIdx]);
              console.log(
                'finish playing, soundFiles now is:',
                soundFiles[sndFileIdx],
              );
            }
          });
        },
      );
    } catch (error) {
      console.error(error);
    }
    () => {
      console.log('currentSound && currentSound.current', currentSound);
      if (currentSound && currentSound.current) {
        currentSound.current.release();
        setCount(count => count + 1);
        const sndFileIdx = (count + 1) % soundFiles.length;
        if (sndFileIdx === 0) {
          shuffleArray(soundFiles);
        }
        setCurrentTrackName(soundFiles[sndFileIdx]);
        console.log(
          'finish playing, soundFiles now is:',
          soundFiles[sndFileIdx],
        );
      }
    };
  }, [currentTrackName]);

  useEffect(() => {
    loadImgFilesFromNAS();
    const interval = setInterval(() => {
      dispatch({type: 'count'});
    }, 5000);

    return () => {
      clearInterval(interval);
      if (currentSound && currentSound.current) {
        currentSound.current.release();
      }
    };
  }, []);

  const addTenMins = () => {
    dispatch({type: 'addTen'});
  };

  const minusTenMins = () => {
    dispatch({type: 'minusTen'});
  };

  const opacity = new Animated.Value(0);

  const onLoad = opacity => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  if (!state || !state.imgFiles || state.imgFiles.length < 1) return;

  let imgUrl = getImgFileUrl(
    state.imgFiles,
    state.imgDispCount % state.imgFiles.length,
    sid,
  );

  var AnimatedImage = Animated.createAnimatedComponent(ImageBackground);

  return (
    <AnimatedImage
      onLoad={onLoad(opacity)}
      source={{uri: imgUrl}}
      style={[
        styles.image,
        {
          opacity,
          transform: [
            {
              scale: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
              }),
            },
          ],
        },
      ]}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonborder]}
          onPress={() => props.setMode('home')}>
          <Text style={styles.text}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonborder]}
          onPress={() => minusTenMins()}>
          <Text style={styles.text}>T-</Text>
        </TouchableOpacity>
        <View style={styles.button}>
          <Text style={styles.text}>
            {secondToDate(state.timeCount - state.imgDispCount * 5)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.buttonborder]}
          onPress={() => addTenMins()}>
          <Text style={styles.text}>T+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <Text style={[styles.bgminfo]}>BGM: {currentTrackName}</Text>
      </View>
    </AnimatedImage>
  );
};

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: 90,
    height: 30,
    marginRight: 80,
    marginLeft: 30,
    marginTop: 960,
  },
  buttonborder: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 6,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bgminfo: {
    color: 'white',
    fontStyle: 'italic',
    fontSize: 10,
    paddingLeft: 10,
    marginTop: 10,
  },
  time: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  buttonContainer: {
    flexDirection: 'row',
    opacity: 0.5,
  },
  image: {
    flex: 1,
    resizeMode: 'contain', // or 'cover' 'center' 'contain' 'repeat' 'stretch',
    backgroundColor: '#000000',
    width: '100%',
  },
});
