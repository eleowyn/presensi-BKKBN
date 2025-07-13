/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {Account, DashboardAdmin, Lists} from './src/pages';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => Lists);
