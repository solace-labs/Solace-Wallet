/**
 * @format
 */
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import {AppRegistry} from 'react-native';
import App from './App';
import {Buffer} from 'buffer';
import {name as appName} from './app.json';

global.Buffer = Buffer;

AppRegistry.registerComponent(appName, () => App);
