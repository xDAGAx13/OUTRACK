import { initializeApp } from "firebase/app";
import { getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore} from 'firebase/firestore';
import { initializeAuth } from "firebase/auth/cordova";
import Constants from 'expo-constants'


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
export const auth = initializeAuth(firebaseapp,{
  persistence: getReactNativePersistence(AsyncStorage),

})