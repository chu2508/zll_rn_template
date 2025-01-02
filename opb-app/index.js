import 'react-native-get-random-values';

import 'reflect-metadata';

import './gesture-handler';

import './global.css';

import './src/i18n/i18n';

import NewRelic from 'newrelic-react-native-agent';
import { Platform } from 'react-native';
import { AppRegistry } from 'react-native';
import Purchases from 'react-native-purchases';

import App from './App';
import { name as appName, version } from './app.json';
import { initDB } from './src/orm/init';

let appToken;
if (Platform.OS === 'ios') {
  appToken = 'AAf07396c24a1a9c84036ec0601cfaca13ac7281b3-NRMA';
} else {
  appToken = 'AA7d32ac4add31462c9e82a8a37fa0f91c6efbdf76-NRMA';
}

const agentConfiguration = {
  // Android Specific
  // Optional:Enable or disable collection of event data.
  analyticsEventEnabled: true,

  // Optional:Enable or disable crash reporting.
  crashReportingEnabled: true,

  // Optional:Enable or disable interaction tracing. Trace instrumentation still occurs, but no traces are harvested.
  // This will disable default and custom interactions.
  interactionTracingEnabled: false,

  // Optional:Enable or disable reporting successful HTTP requests to the MobileRequest event type.
  networkRequestEnabled: true,

  // Optional:Enable or disable reporting network and HTTP request errors to the MobileRequestError event type.
  networkErrorRequestEnabled: true,

  // Optional:Enable or disable capture of HTTP response bodies for HTTP error traces, and MobileRequestError events.
  httpRequestBodyCaptureEnabled: true,

  // Optional:Enable or disable agent logging.
  loggingEnabled: true,

  // Optional:Specifies the log level. Omit this field for the default log level.
  // Options include: ERROR (least verbose), WARNING, INFO, VERBOSE, AUDIT (most verbose).
  logLevel: NewRelic.LogLevel.INFO,

  // iOS Specific
  // Optional:Enable/Disable automatic instrumentation of WebViews
  webViewInstrumentation: true,

  // Optional:Set a specific collector address for sending data. Omit this field for default address.
  collectorAddress: '',

  // Optional:Set a specific crash collector address for sending crashes. Omit this field for default address.
  crashCollectorAddress: '',

  // Optional:Enable or disable reporting data using different endpoints for US government clients
  fedRampEnabled: false,

  // Optional: Enable or disable offline data storage when no internet connection is available.
  offlineStorageEnabled: true,

  // iOS Specific
  // Optional: Enable or disable Background Reporting.
  backgroundReportingEnabled: false,

  // iOS Specific
  // Optional: Enable or disable to use our new, more stable event system for iOS agent.
  newEventSystemEnabled: true,
};

// 初始化数据库
initDB();

NewRelic.startAgent(appToken, agentConfiguration);
NewRelic.setJSAppVersion(version);

AppRegistry.registerComponent(appName, () => App);
