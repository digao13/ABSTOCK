import {
    getApps,
    initializeApp
} from "firebase/app";

import {
    getAuth
} from "firebase/auth";

import {
    getFirestore
} from "firebase/firestore";

// ======================================================
// CONFIGURAÇÃO DO FIREBASE
// ======================================================

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ======================================================
// FIREBASE PRINCIPAL
// ======================================================
//
// Esta instância é utilizada pelo usuário atualmente
// autenticado.
//
// Também é a instância utilizada pelo Firestore.
// ======================================================

const app =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;

// ======================================================
// FIREBASE SECUNDÁRIO
// ======================================================
//
// Utilizado exclusivamente para criação de usuários.
//
// Isso impede que createUserWithEmailAndPassword()
// substitua a sessão do administrador.
//
// O administrador continua conectado na instância
// principal.
// ======================================================

const secondaryAppName =
    "ABSTOCK-USER-CREATION";

const apps = getApps();

const secondaryApp =
    apps.find(
        (firebaseApp) =>
            firebaseApp.name === secondaryAppName
    ) ||
    initializeApp(
        firebaseConfig,
        secondaryAppName
    );

export const authSecundario =
    getAuth(secondaryApp);