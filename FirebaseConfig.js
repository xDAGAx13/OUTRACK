import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from 'firebase/firestore';
import Constants from 'expo-constants'
import { Platform } from 'react-native';


const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig.extra.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig.extra.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig.extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig.extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig.extra.FIREBASE_APP_ID
};

export const firebaseapp = initializeApp(firebaseConfig);
export const FIREBASE_DB = getFirestore(firebaseapp)

function createAuth() {
  if (Platform.OS === 'web') {
    return getAuth(firebaseapp);
  }
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return initializeAuth(firebaseapp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth = createAuth();