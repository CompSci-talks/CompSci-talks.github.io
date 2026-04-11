
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import * as fs from 'fs';

// Load environment from src/environments/environment.ts (simplified)
const envFile = fs.readFileSync('src/environments/environment.ts', 'utf8');
const match = envFile.match(/firebaseConfig:\s*({[\s\S]*?})/);
if (!match) {
    console.error('Could not find firebaseConfig in environment.ts');
    process.exit(1);
}
const firebaseConfig = eval(`(${match[1]})`);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncAllRSVPs() {
    console.log('Starting RSVP sync...');
    const seminarsSnap = await getDocs(collection(db, 'seminars'));

    console.log(`Found ${seminarsSnap.size} seminars.`);

    for (const seminarDoc of seminarsSnap.docs) {
        const id = seminarDoc.id;
        const data = seminarDoc.data() as any;
        const rsvpsQuery = query(collection(db, 'rsvps'), where('seminar_id', '==', id));
        const rsvpsSnap = await getDocs(rsvpsQuery);
        const count = rsvpsSnap.size;

        console.log(`Seminar "${data.title}" (${id}): Found ${count} RSVPs. Updating stats...`);
        await updateDoc(doc(db, 'seminars', id), {
            'stats.rsvp_count': count,
            'stats.updated_at': new Date()
        });
    }
    console.log('RSVP sync complete!');
}

syncAllRSVPs().catch(console.error);
