import { Auth } from 'aws-amplify';
import React, {useEffect, useState} from 'react';
import {
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import Sound from 'react-native-sound';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {ImageLoader} from './components/ImageLoader';
import { Memo } from './components/Memo';

const Section = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [mode, setMode] = useState('home');

  let welcomeSound;

  useEffect(() => {
    Sound.setCategory('Playback', true); // true = mixWithOthers
    welcomeSound = new Sound(
      'https://raw.githubusercontent.com/solariswu/musicstore/master/assets/hello.mp3',
      '', //Sound.MAIN_BUNDLE,
      (error, _sound) => {
        if (error) {
          alert('error' + error.message);
          return;
        }
        welcomeSound.play(() => {
          welcomeSound.release();
        });
      },
    );

    Auth.signIn('solariswu', '963717');

    return () => {
      if (welcomeSound) welcomeSound.release();
    };
  }, []);

  const changeMode = (mode = 'home') => {
    setMode(mode);
  }

  switch (mode) {
    case 'home':
      return (
        <ImageBackground
          source={require('./bg.png')}
          resizeMode="cover"
          style={styles.image}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Section children={'Home'} title={'Welcome'} />
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
    marginTop: 100,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '600',
    alignItems: 'center',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '400',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: 120,
    height: 110,
    margin: 10,
    // backgroundColor: "#222222",
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
