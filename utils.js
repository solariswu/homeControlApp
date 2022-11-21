let RNFS = require('react-native-fs');

export const BASEPATH = RNFS.DocumentDirectoryPath;
export const TIME_FILENAME = 'timenow';

export const saveMp3file = async (fileName, audioStream) => {
  // create a path you want to write to
  // :warning: on iOS, you cannot write into `RNFS.MainBundlePath`,
  // but `RNFS.DocumentDirectoryPath` exists on both platforms and is writable
  const toFile = `${BASEPATH}/${fileName}.mp3`;

  // write the file
  return RNFS.writeFile(toFile, audioStream.toString('base64'), 'base64');
};

export const shuffleArray = array => {
  let curId = array.length;
  // There remain elements to shuffle
  while (0 !== curId) {
    // Pick a remaining element
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    // Swap it with the current element.
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
};
