import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0qkdwyVD1w7Kn6xuo4Nxf8b8EA00alZs",
  authDomain: "alugapp-828eb.firebaseapp.com",
  projectId: "alugapp-828eb",
  storageBucket: "alugapp-828eb.firebasestorage.app",
  messagingSenderId: "551924242633",
  appId: "1:551924242633:web:e504849592365a763f9518",
  // measurementId: "G-6861XFDQT9" não necessario para react native
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);