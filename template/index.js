import './gesture-handler';

import './global.css';

import './src/i18n/i18n';

import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
