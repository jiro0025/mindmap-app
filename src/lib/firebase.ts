import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWCIscrwrKo9gvYDDr4H4X7e3qVjMI8JA",
  authDomain: "my-mindmap-app-a10da.firebaseapp.com",
  projectId: "my-mindmap-app-a10da",
  storageBucket: "my-mindmap-app-a10da.firebasestorage.app",
  messagingSenderId: "18770687527",
  appId: "1:18770687527:web:481d2e5c5161a424dfc002",
  measurementId: "G-17T7MKXXS1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
