import React, {useEffect, useReducer, useRef, useState} from 'react';
import {Animated} from 'react-native';
import Sound from 'react-native-sound';
import {pwd} from './const';

const githubRawAssetsPath =
  'https://raw.githubusercontent.com/solariswu/musicstore/master/assets/';
const soundFiles = [
  'welcome.mp3',
  '001.mp3',
  '002.mp3',
  '003.mp3',
  '004.mp3',
  '005.mp3',
  '006.mp3',
  '007.mp3',
  '008.mp3',
  '009.mp3',
  '010.mp3',
  '011.mp3',
  '012.mp3',
];

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
  const [state, dispatch] = useReducer(reducer, {imgDispCount: 0});
  const [currentTrackName, setCurrentTrackName] = useState(soundFiles[0]);
  const [count, setCount] = useState(0);
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
      dispatch({type: 'setImage', payload: files});
    } catch (error) {
      console.error(error);
    }
  };

  const initState = {
    count: 0,
    imgFiles: [],
  };

  function reducer(state = initState, action) {
    switch (action.type) {
      case 'count':
        if (state && state.imgFiles && state.imgFiles.length > 1)
          return {
            ...state,
            imgDispCount:
              state.imgDispCount + 1 >= state.imgFiles.length
                ? 0
                : state.imgDispCount + 1,
          };
        return state;
      case 'setImage':
        return {...state, imgFiles: action.payload};
      default:
        break;
    }
  }

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
              setCount(count => (count + 1 >= soundFiles.size ? 0 : count + 1));
              let soundIdx = count + 1 >= soundFiles.size ? 0 : count + 1;
              setCurrentTrackName(soundFiles[soundIdx]);
              console.log(
                'finish playing, soundfiles now is:',
                soundFiles[soundIdx],
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
        setCount(count => (count + 1 >= soundFiles.size ? 0 : count + 1));
        let soundIdx = count + 1 >= soundFiles.size ? 0 : count + 1;
        setCurrentTrackName(soundFiles[soundIdx]);
        console.log('finish playing, soundfiles now is:', soundFiles[soundIdx]);
      }
    };
  }, [currentTrackName]);

  useEffect(() => {
    loadImgFilesFromNAS();
    const interval = setInterval(() => {
      dispatch({type: 'count'});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const opacity = new Animated.Value(0);

  const onLoad = opacity => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  if (!state || !state.imgFiles || state.imgFiles.length < 1) return;

  let imgUrl = getImgFileUrl(state.imgFiles, state.imgDispCount, sid);

  return (
    <Animated.Image
      onLoad={onLoad(opacity)}
      source={{uri: imgUrl}}
      style={[
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
        props.style,
      ]}
    />
  );
};
