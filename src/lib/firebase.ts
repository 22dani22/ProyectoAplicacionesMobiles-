/**
 * firebase.ts — Inicialización de Firebase (Auth + Firestore)
 *
 * Las claves se leen de variables de entorno EXPO_PUBLIC_* definidas en `.env`.
 * Estas claves NO son secretas: identifican el proyecto. Lo que protege los
 * datos son las reglas de seguridad de Firestore (ver firestore.rules).
 */
import { Platform } from "react-native";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { getAuth, initializeAuth, type Auth, type Persistence } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigurado = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

if (!firebaseConfigurado) {
  console.warn(
    "[Firebase] Faltan variables EXPO_PUBLIC_FIREBASE_* en el archivo .env. " +
      "Pega ahí los datos de tu proyecto de Firebase."
  );
}

// Evita inicializar dos veces con el hot reload
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// getReactNativePersistence existe en el build de React Native de Firebase,
// pero no aparece en los tipos web, por eso se accede de forma dinámica.
const getReactNativePersistence = (
  FirebaseAuth as unknown as {
    getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
  }
).getReactNativePersistence;

// Auth con sesión persistente (el usuario sigue logueado al cerrar la app)
function crearAuth(): Auth {
  if (Platform.OS === "web" || !getReactNativePersistence) return getAuth(app);
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Ya estaba inicializado (hot reload)
    return getAuth(app);
  }
}
export const auth = crearAuth();

// Firestore: ignoreUndefinedProperties evita errores con campos opcionales vacíos
function crearDb(): Firestore {
  try {
    return initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    return getFirestore(app);
  }
}
export const db = crearDb();
