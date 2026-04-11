// scripts/e2e/helpers/seed-data.js
const { createTestUser, elevateToAdmin } = require('../../supabase-utils');

async function seed() {
    console.log('[Seed] Seeding test users...');
    try {
        // Admin user
        // Note: Users are now pre-seeded via REST API in scripts/seed-firebase-auth.ps1
        console.log('[Seed] Users pre-seeded via REST API.');
    } catch (err) {
        if (err.message.includes('already registered')) {
            console.log('[Seed] Users already exist, skipping.');
        } else {
            console.error('[Seed] Error during seeding:', err);
        }
    }
}

if (require.main === module) {
    seed();
}

module.exports = { seed };
