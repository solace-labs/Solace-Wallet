/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-get-random-values';
import {Buffer} from '@craftzdog/react-native-buffer';

global.Buffer = Buffer

AppRegistry.registerComponent(appName, () => App);
