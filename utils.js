let RNFS = require('react-native-fs');

export const BASEPATH = RNFS.DocumentDirectoryPath;

export const saveMp3file = async (fileName, audioStream) => {
    // create a path you want to write to
    // :warning: on iOS, you cannot write into `RNFS.MainBundlePath`,
    // but `RNFS.DocumentDirectoryPath` exists on both platforms and is writable
    const toFile = `${BASEPATH}/${fileName}.mp3`;

    // write the file
    return RNFS.writeFile(toFile, audioStream.toString('base64'), 'base64');
  };