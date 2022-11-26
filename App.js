import {Auth} from 'aws-amplify';
import React, {useEffect, useState, useRef} from 'react';
import {
  AppState,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Sound from 'react-native-sound';

import {ImageLoader} from './components/ImageLoader';
import {Memo} from './components/Memo';

import {saveMp3file, BASEPATH, TIME_FILENAME} from './utils';

import {ASIS, SECC} from './const';

const Section = ({children, title}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle]}>{title}</Text>
      <Text style={[styles.sectionDescription]}>{children}</Text>
    </View>
  );
};

let AWS = require('aws-sdk/dist/aws-sdk-react-native');
let polly = new AWS.Polly({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: ASIS,
    secretAccessKey: SECC,
  },
});

const App = () => {
  const [mode, setMode] = useState('home');
  const appState = useRef(AppState.currentState);
  const currentSound = useRef(null);

  const getAndPlayTimeNow = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const prefixTimeMin = minutes > 9 ? '' : '0';
    // console.log('timenow:', timeNowText);

    const pollyParams = {
      OutputFormat: 'mp3',
      LanguageCode: 'cmn-CN',
      Text: `现在时刻${hours}点` + prefixTimeMin + `${minutes}分`,
      VoiceId: 'Zhiyu',
    };
    polly
      .synthesizeSpeech(pollyParams)
      .promise()
      .then(data => {
        return saveMp3file(TIME_FILENAME, data.AudioStream);
      })
      .then(() => {
        console.log('start new sound', `${TIME_FILENAME}.mp3`);
        const timeSnd = new Sound(
          `${BASEPATH}/${TIME_FILENAME}.mp3`,
          '', //Sound.MAIN_BUNDLE,
          (error, _sound) => {
            if (error) {
              console.error('error on loading Sound', error);
              return;
            }

            if (currentSound && currentSound.current) {
              currentSound.current.release();
            }
            currentSound.current = timeSnd.play(success => {
              if (!success) {
                console.error('unable to play Sound');
              } else {
                console.log('finish playing time now');
              }
            });
          },
        );
      });
  };

  useEffect(() => {
    Sound.setCategory('Playback', true); // true = mixWithOthers
    getAndPlayTimeNow();
    // currentSound.current = new Sound(
    //   'https://raw.githubusercontent.com/solariswu/musicstore/master/assets/hello.mp3',
    //   '', //Sound.MAIN_BUNDLE,
    //   (error, _sound) => {
    //     if (error) {
    //       alert('error' + error.message);
    //       return;
    //     }
    //     currentSound.current.play();
    //     // () => {
    //     //   currentSound.current.release();
    //     // });
    //   },
    // );

    Auth.signIn('solariswu', '963717');

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (mode === 'home') {
          getAndPlayTimeNow();
        }

        // console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
      // setAppStateVisible(appState.current);
      // console.log('AppState', appState.current);
    });

    return () => {
      if (currentSound && currentSound.current) {
        currentSound.current.release();
      }
      subscription.remove();
    };
  }, []);

  const changeMode = (mode = 'home') => {
    setMode(mode);
  };

  switch (mode) {
    case 'home':
      return (
        <ImageBackground
          source={require('./bg.png')}
          resizeMode="cover"
          style={styles.image}>
          <Section children={'#Sydney'} title={'Welcome Home'} />
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setMode('in')}>
              <Text style={styles.text}>In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setMode('out')}>
              <Text style={styles.text}>Out</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      );
    case 'in':
      return <ImageLoader style={styles.image} setMode={changeMode} />;
    case 'out':
      return <Memo style={styles.image} setMode={changeMode} />;
    default:
      break;
  }
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 150,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '600',
    alignItems: 'center',
    color: 'white',
    textShadowColor: '#000',
    textShadowRadius: 2,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '400',
    alignItems: 'center',
    color: 'white',
    textShadowColor: '#000',
    textShadowRadius: 2,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  highlight: {
    fontWeight: '700',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: 120,
    height: 110,
    margin: 100,
    marginTop: 250,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontSize: 32,
    // lineHeight: 84,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  image: {
    flex: 1,
    resizeMode: 'contain', // or 'cover' 'center' 'contain' 'repeat' 'stretch',
    backgroundColor: '#000000',
  },
});

export default App;
