// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDW5FH6g3DGfAEBiLfrR4eePH-NGo0mup8',
  authDomain: 'bkkbn-a7b70.firebaseapp.com',
  databaseURL: 'https://bkkbn-a7b70-default-rtdb.firebaseio.com',
  projectId: 'bkkbn-a7b70',
  storageBucket: 'bkkbn-a7b70.firebasestorage.app',
  messagingSenderId: '53262013678',
  appId: '1:53262013678:web:03d153f60f77b9217c0fff',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export default app;
