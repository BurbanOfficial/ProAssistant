/**
 * Configuration Firebase - ProAssistant
 * Synchronisation cloud des données en temps réel
 */

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBnQp9i5dbWH9LeoDgzvGAlYwzn_ybYm7Y",
    authDomain: "proassistant-b1e74.firebaseapp.com",
    projectId: "proassistant-b1e74",
    storageBucket: "proassistant-b1e74.appspot.com",
    messagingSenderId: "55318667528",
    appId: "1:55318667528:web:bbafe6bc5b0f13070c4cbd",
    measurementId: "G-T5KCN5NWV2"
};

/**
 * INSTRUCTIONS DE CONFIGURATION
 * ==============================
 * 
 * 1. Créer un compte Firebase gratuit:
 *    https://firebase.google.com/
 * 
 * 2. Créer un nouveau projet:
 *    - Cliquer "Créer un projet"
 *    - Nommer le projet "proassistant"
 *    - Accepter les conditions
 * 
 * 3. Activer Firestore Database:
 *    - Aller à "Firestore Database"
 *    - Cliquer "Créer une base de données"
 *    - Mode: "Démarrer en mode test"
 *    - Localisation: "eur3 (Europe)"
 *    - Cliquer "Créer"
 * 
 * 4. Récupérer les identifiants:
 *    - Aller à "Paramètres du projet"
 *    - Onglet "Général"
 *    - Section "Vos applications"
 *    - Cliquer sur "Web" (icon </> )
 *    - Copier la configuration
 * 
 * 5. Remplacer les valeurs ci-dessus par votre configuration
 * 
 * 6. Redémarrer l'application
 * 
 * ⚠️ IMPORTANT - Règles de sécurité Firestore:
 * 
 * Une fois en production, remplacer par:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /users/{uid}/clients/{document=**} {
 *       allow read, write: if request.auth.uid == uid;
 *     }
 *     match /users/{uid}/interventions/{document=**} {
 *       allow read, write: if request.auth.uid == uid;
 *     }
 *     match /users/{uid}/invoices/{document=**} {
 *       allow read, write: if request.auth.uid == uid;
 *     }
 *     match /users/{uid}/profile/{document=**} {
 *       allow read, write: if request.auth.uid == uid;
 *     }
 *   }
 * }
 */

// Initialiser Firebase
if (!firebase) {
    console.error('⚠️ Firebase SDK non chargé. Ajouter le script de Firebase en premier.');
}

firebase.initializeApp(firebaseConfig);

// Initialiser Firestore
const db = firebase.firestore();
const auth = firebase.auth();

// Activer la persistance offline
db.enablePersistence()
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Plusieurs onglets ouverts - persistance désactivée');
        } else if (err.code === 'unimplemented') {
            console.warn('Navigateur ne supporte pas la persistance offline');
        }
    });

console.log('✅ Firebase Firestore initialisé');
