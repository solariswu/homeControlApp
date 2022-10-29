/**
 * @format
 */

import {Amplify, Auth} from 'aws-amplify';
import awsconfig from './aws-exports';
import {ASIS, SECC} from './const';
let AWS = require('aws-sdk/dist/aws-sdk-react-native');

Amplify.configure(awsconfig);

Auth.configure({
  authenticationFlowType: 'USER_PASSWORD_AUTH',
});

AWS.config.credentials = new AWS.Credentials(ASIS, SECC);

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
