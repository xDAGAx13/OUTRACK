import { initializeApp } from "firebase/app";
import { getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getFirestore} from 'firebase/firestore';
import { initializeAuth } from "firebase/auth/cordova";
import Constants from 'expo-constants'


const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.FIREBASE_API_KEY,
  authDomain: "outrack-22af1.firebaseapp.com",
  projectId: "outrack-22af1",
  storageBucket: "outrack-22af1.firebasestorage.app",
  messagingSenderId: "304072799186",
  appId: "1:304072799186:web:f77bdd4782ad39367e4e0b"
};

export const firebaseapp = initializeApp(firebaseConfig);
export const FIREBASE_DB = getFirestore(firebaseapp)
export const auth = initializeAuth(firebaseapp,{
  persistence: getReactNativePersistence(AsyncStorage),

})
console.log(firebaseapp.options.projectId);
console.log(firebaseapp.options.apiKey);
