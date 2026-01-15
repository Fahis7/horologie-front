// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <--- Added this

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu5WG7sVhuHw7oK6owvkcxcu8zW0iD2mo",
  authDomain: "horologie-live.firebaseapp.com",
  projectId: "horologie-live",
  storageBucket: "horologie-live.firebasestorage.app",
  messagingSenderId: "909924517874",
  appId: "1:909924517874:web:982ec86c4ad7fcd7afcd6b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and Export Authentication
export const auth = getAuth(app); // <--- Added this export
export default app;