// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: "outrack",
    slug: "outrack",
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      "eas":{
        "projectId":"bf14bfdd-6b4a-4253-bcf2-fbe6429609b5"
      },
      "owner":"dagax13",
      "updates": {
    "url": "https://u.expo.dev/bf14bfdd-6b4a-4253-bcf2-fbe6429609b5"  
  },
  "runtimeVersion": {
    "policy": "appVersion"
  }
    },
  },
  
  


};
