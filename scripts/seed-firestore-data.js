
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, doc, setDoc, Timestamp } = require('firebase/firestore');

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

async function seed() {
    console.log('Logging in as admin...');
    try {
        await signInWithEmailAndPassword(auth, 'admin@compsci.test', 'TestPassword123!');
        console.log('Login successful.');

        // 1. Seed Semester
        console.log('Seeding semester...');
        const semesterRef = await addDoc(collection(db, 'semesters'), {
            name: 'Spring 2027',
            start_date: Timestamp.fromDate(new Date('2027-01-01')),
            end_date: Timestamp.fromDate(new Date('2027-06-30')),
            is_active: true
        });
        console.log('Semester seeded with ID:', semesterRef.id);

        // 2. Seed Tag
        console.log('Seeding tag...');
        const tagRef = await addDoc(collection(db, 'tags'), {
            name: 'Computing',
            color_code: '#3b82f6'
        });
        console.log('Tag seeded with ID:', tagRef.id);

        // 3. Seed Speaker
        console.log('Seeding speaker...');
        const speakerRef = await addDoc(collection(db, 'speakers'), {
            name: 'Dr. Alan Turing',
            bio: 'Father of theoretical computer science and artificial intelligence.',
            role: 'Guest Speaker',
            image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        });
        console.log('Speaker seeded with ID:', speakerRef.id);

        // 4. Seed Seminar
        console.log('Seeding seminar...');
        const seminarData = {
            title: 'Quantum Computing 101',
            description: 'An introduction to the fundamental principles of quantum computing.',
            date_time: Timestamp.fromDate(new Date('2027-04-15T10:00:00')),
            location: 'Main Auditorium',
            speaker_ids: [speakerRef.id],
            tag_ids: [tagRef.id],
            stats: {
                rsvp_count: 0,
                comment_count: 0
            },
            // Emulate enrichment as the app service does
            speakers: [{ id: speakerRef.id, name: 'Dr. Alan Turing' }],
            tags: [{ id: tagRef.id, name: 'Computing', color_code: '#3b82f6' }]
        };
        const seminarRef = await addDoc(collection(db, 'seminars'), seminarData);
        console.log('Seminar seeded with ID:', seminarRef.id);

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
