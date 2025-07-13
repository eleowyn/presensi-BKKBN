import {initializeApp} from 'firebase/app';
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBHe3xZ_JzjgYb-2l6l9hbfsrBI0QZ4AIc',
  authDomain: 'u-found-c0e9c.firebaseapp.com',
  projectId: 'u-found-c0e9c',
  storageBucket: 'u-found-c0e9c.firebasestorage.app',
  messagingSenderId: '685688591584',
  appId: '1:685688591584:web:25f0b109f2ab7231542c85',
  databaseURL: 'https://u-found-c0e9c-default-rtdb.firebaseio.com/',
};

const app = initializeApp(firebaseConfig);
initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export default app;
