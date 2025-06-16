// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: "outrack",
    slug: "outrack",
    "owner":"dagax13",
      "updates": {
    "url": "https://u.expo.dev/778641f5-8e2c-4c01-b818-834b2b8a3121"  
  },
  "runtimeVersion": {
    "policy": "appVersion"
  },
  "android": {
      "package": "com.dagax13.outrack"
    },
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      "eas":{
        "projectId":"778641f5-8e2c-4c01-b818-834b2b8a3121"
      }
      
    },
  },
  
  


};
