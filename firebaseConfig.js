import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyB9n_UaGmQ5fLH9T7gMp6od7WzgfyGtmcs",
  authDomain: "setrin-9124a.firebaseapp.com",
  projectId: "setrin-9124a",
  storageBucket: "setrin-9124a.appspot.com",
  messagingSenderId: "474078857325",
  appId: "1:474078857325:web:4c3e82ee80c62d66351764",
  measurementId: "G-WQ6L8VVTH3"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);