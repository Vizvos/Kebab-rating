// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCfG4MCg5j9ohj_RAwcAVY4JZCRWId9y_0",
  authDomain: "kebabrating.firebaseapp.com",
  projectId: "kebabrating",
  storageBucket: "kebabrating.firebasestorage.app",
  messagingSenderId: "679455164281",
  appId: "1:679455164281:web:a9417d284291f257f511a8"
};

// Initialize Firebase
console.log("FIREBASE CONFIG BEING PASSED TO SDK:", firebaseConfig);
console.log("IS API KEY EXACTLY AS HARDCODED?", firebaseConfig.apiKey === "AIzaSyCfG4MCg5j9ohj_RAwcAVY4JZCRWId9y_O");

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
