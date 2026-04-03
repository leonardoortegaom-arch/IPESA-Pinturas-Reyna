import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAc9qTHix80szcpHA-_smMPepwf218hToQ",
  authDomain: "estadia-d27c9.firebaseapp.com",
  databaseURL: "https://estadia-d27c9-default-rtdb.firebaseio.com",
  projectId: "estadia-d27c9",
  storageBucket: "estadia-d27c9.firebasestorage.app",
  messagingSenderId: "376370671342",
  appId: "1:376370671342:web:87159aaa188cea502b0dff"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);