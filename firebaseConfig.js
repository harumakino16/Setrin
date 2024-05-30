import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyBpNvOh7IiyZzUv9Ysce0OijVlnXnWxFA0",
  authDomain: "regal-muse-384522.firebaseapp.com",
  projectId: "regal-muse-384522",
  storageBucket: "regal-muse-384522.appspot.com",
  messagingSenderId: "649488417421",
  appId: "1:649488417421:web:2bdd25f3b5d0175defd8c4",
  measurementId: "G-KR13S5GCRB"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// export const analytics = getAnalytics(app);

