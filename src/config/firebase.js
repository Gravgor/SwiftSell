import { initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBsKHkxJNFN33c5dEmXkNjatmVfQMrhtiE",
  authDomain: "swiftsellf.firebaseapp.com",
  projectId: "swiftsellf",
  storageBucket: "swiftsellf.firebasestorage.app",
  messagingSenderId: "35899047301",
  appId: "1:35899047301:ios:84a05765495a4ef690d8ec"
};


export const initializeFirebase = () => {
  initializeApp(firebaseConfig);
}; 