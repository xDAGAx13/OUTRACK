import 'dotenv/config'
export default{
  "expo": {
    "name": "OUTRACK",
    "slug": "OUTRACK",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "outrack",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "entryPoint": "./index.js",
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra":{
      "eas":{
        "projectId":"744e2a25-cd6c-4fd2-bc3b-52d72cadd1bf"
      },
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,      
        
    },
    "updates":{
      "url": "https://u.expo.dev/744e2a25-cd6c-4fd2-bc3b-52d72cadd1bf",  
    },
    "owner":"dagax13",
  "runtimeVersion": {
    "policy": "appVersion"
  }
    
  }
}
