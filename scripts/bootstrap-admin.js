
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyBq_V-h82VJQIlMSsf-MBqqKQAs5KsQ1iY",
    authDomain: "compsci-b5aa2.firebaseapp.com",
    projectId: "compsci-b5aa2",
    storageBucket: "compsci-b5aa2.firebasestorage.app",
    messagingSenderId: "967108755777",
    appId: "1:967108755777:web:8107aa80e359ad220261c0",
    measurementId: "G-MCM2GBZV4C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function bootstrap() {
    const uid = process.argv[2];
    if (!uid) {
        console.error('Usage: node scripts/bootstrap-admin.js <UID>');
        process.exit(1);
    }

    console.log(`Promoting user ${uid} to admin...`);
    try {
        // We use the same test credentials as seed-firestore-data.js to authenticate
        await signInWithEmailAndPassword(auth, 'admin@compsci.test', 'TestPassword123!');
        console.log('Authentication successful.');

        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            role: 'admin'
        });

        console.log(`Successfully promoted ${uid} to admin.`);
        process.exit(0);
    } catch (error) {
        console.error('Bootstrap failed:', error);
        process.exit(1);
    }
}

bootstrap();
