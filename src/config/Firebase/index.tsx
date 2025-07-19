// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {getFirestore} from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);
export {app, auth, db};
