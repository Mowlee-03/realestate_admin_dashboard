// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAijJOLM3Wso6wTQNaega52uq9MQw-spqQ",
  authDomain: "clone-404e3.firebaseapp.com",
  projectId: "clone-404e3",
  storageBucket: "clone-404e3.appspot.com",
  messagingSenderId: "139997770755",
  appId: "1:139997770755:web:babffca66a705c92dd8a36",
  measurementId: "G-4X0N596JWW"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp