const admin = require('firebase-admin');
const path = require('path');

/**
 * MIGRATION SCRIPT: Verify All Users
 * ---------------------------------
 * This script will loop through all accounts in Firebase Authentication
 * and mark their email as verified. This is useful for existing test accounts
 * that are currently being blocked by the new email verification requirement.
 * 
 * PRE-REQUISITES:
 * 1. Download service-account.json from Firebase Console.
 * 2. Run 'npm install firebase-admin'
 */

// Load the service account key from the root of the project
const serviceAccountPath = path.join(__dirname, '../service-account.json');

try {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    async function verifyAllUsers() {
        console.log('\n🚀 Starting Bulk Verification...');
        let nextPageToken;
        let totalVerified = 0;
        let totalUsers = 0;

        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            totalUsers += listUsersResult.users.length;

            const updates = listUsersResult.users.map(async (user) => {
                const needsAuthVerify = !user.emailVerified;

                // Always try to update Firestore for the 20 users we care about
                // as well as the Auth record if needed.
                if (needsAuthVerify) {
                    await admin.auth().updateUser(user.uid, { emailVerified: true });
                    console.log(`  ✅ Auth Verified: ${user.email.padEnd(30)}`);
                    totalVerified++;
                }

                // Also sync to Firestore users collection
                try {
                    const userDoc = admin.firestore().collection('users').doc(user.uid);
                    const docSnapshot = await userDoc.get();

                    if (docSnapshot.exists) {
                        await userDoc.update({ email_verified: true });
                        console.log(`  🔗 Firestore Synced: ${user.email.padEnd(30)}`);
                    }
                } catch (fsError) {
                    console.error(`  ⚠️ Firestore update failed for ${user.email}:`, fsError.message);
                }
            });

            await Promise.all(updates);
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        console.log('\n--- Migration Summary ---');
        console.log(`Total Users Processed: ${totalUsers}`);
        console.log(`Newly Verified Users: ${totalVerified}`);
        console.log('-------------------------\n');
        process.exit(0);
    }

    verifyAllUsers().catch(error => {
        console.error('\n❌ Fatal Error during verification:', error.message);
        process.exit(1);
    });

} catch (err) {
    console.error('\n❌ Configuration Error:');
    console.error(`Could not find service-account.json at: ${serviceAccountPath}`);
    console.error('Please download it from Firebase Console (Settings > Service Accounts) and save it as "service-account.json" in the root of your project.\n');
    process.exit(1);
}
