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

import {ImageLoader} from './ImageLoader';
import {MusicLoader} from './MusicLoader';

const bgImg = {uri: 'https://s1.ax1x.com/2022/08/14/vURiJ1.png'};

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
  const [sid, setSid] = useState('');
  const [mode, setMode] = useState('home');
  let welcomeSound;

  // const getNasSid = async () => {
  //   try {
  //     const response = await fetch(
  //       'http://192.168.20.15:5000/webapi/entry.cgi?api=SYNO.API.Auth&version=7&method=login&account=clientcredential&passwd=MinYun0404!&format=sid&session=FileStation',
  //     );
  //     const json = await response.json();
  //     setSid(json.data.sid);
  //     const files = await getFileListFromNas(
  //       '/homes/clientcredential/imgs',
  //       json.data.sid,
  //     );
  //     setImgFiles(files);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

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

    return () => {
      if (welcomeSound) welcomeSound.release();
    };
  }, []);

  switch (mode) {
    case 'home':
      return (
        <ImageBackground source={bgImg} resizeMode="cover" style={styles.image}>
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
      // const imgUrl = getImgFileUrl(imgFiles, imgDispCount, sid);
      // return <ImageLoader style={styles.image} source={{uri: imgUrl}} />;
      return (
        // <View>
        //   <MusicLoader />
          <ImageLoader style={styles.image} />
        // </View>
      );
    case 'out':
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
