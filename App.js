import {Auth} from 'aws-amplify';
import React, {useEffect, useState} from 'react';
import {
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import Sound from 'react-native-sound';

import {ImageLoader} from './components/ImageLoader';
import {Memo} from './components/Memo';

const Section = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = () => {
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
    textShadowRadius: 2
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: '400',
    alignItems: 'center',
    color: 'white',
    textShadowColor: '#000',
    textShadowRadius: 2
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
