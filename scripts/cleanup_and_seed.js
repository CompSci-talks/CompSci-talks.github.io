
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, query, where, Timestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
    apiKey: "AIzaSyBq_V-h82VJQIlMSsf-MBqqKQAs5KsQ1iY",
    authDomain: "compsci-b5aa2.firebaseapp.com",
    projectId: "compsci-b5aa2",
    storageBucket: "compsci-b5aa2.firebasestorage.app",
    messagingSenderId: "125026600854",
    appId: "1:125026600854:web:80373e34b12c7d9171f114",
    measurementId: "G-9QNVV08Q6W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function cleanupAndSeed() {
    console.log('Logging in...');
    await signInWithEmailAndPassword(auth, 'admin@compsci.test', 'TestPassword123!');

    console.log('Cleaning up seminars...');
    const seminarsSnap = await getDocs(collection(db, 'seminars'));
    for (const d of seminarsSnap.docs) {
        await deleteDoc(doc(db, 'seminars', d.id));
        console.log(`Deleted seminar: ${d.id}`);
    }

    // Seed and use FIXED IDs to avoid duplicates if re-run
    const semesterId = 'mA2ZoXPciOisoNqkwfjk';
    const tagId = 'pTvPpsAnZ4z53kKNSWxZ';
    const speakerId = 'Gt9k29vD3IngXo0yGhLN';
    const seminarId = 'DmPo7EGv2js8HCaBlfSz';

    console.log('Seeding semester...');
    await setDoc(doc(db, 'semesters', semesterId), {
        name: 'Spring 2027',
        startDate: Timestamp.fromDate(new Date('2027-01-01')),
        endDate: Timestamp.fromDate(new Date('2027-06-30')),
        active: true
    });

    console.log('Seeding tag...');
    await setDoc(doc(db, 'tags', tagId), {
        name: 'Computing',
        color: '#3b82f6'
    });

    console.log('Seeding speaker...');
    await setDoc(doc(db, 'speakers', speakerId), {
        name: 'Dr. Alan Turing',
        bio: 'Father of theoretical computer science and artificial intelligence.',
        email: 'turing@example.com'
    });

    console.log('Seeding seminar...');
    await setDoc(doc(db, 'seminars', seminarId), {
        title: 'Quantum Computing 101',
        description: 'An introduction to the principles of quantum computing.',
        date_time: Timestamp.fromDate(new Date('2027-04-15T10:00:00')),
        location: 'Main Auditorium',
        semester_id: semesterId,
        speaker_id: speakerId,
        tag_ids: [tagId],
        speaker_name: 'Dr. Alan Turing',
        tag_names: ['Computing'],
        image_url: ''
    });

    console.log('Cleanup and seeding completed.');
}

cleanupAndSeed().catch(console.error);
