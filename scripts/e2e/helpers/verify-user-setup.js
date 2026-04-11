// scripts/e2e/helpers/verify-user-setup.js
const { getClient, createTestUser, elevateToAdmin } = require('../../supabase-utils');

async function verify() {
    try {
        const supabase = await getClient();
        console.log('[Verify] Connecting to Supabase...');

        // 1. Try to create/get admin user
        let admin;
        try {
            admin = await createTestUser('admin@example.com', 'admin123', 'Admin User');
            console.log('[Verify] Admin user created.');
        } catch (err) {
            console.log('[Verify] Admin user might already exist, checking sign in...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'admin@example.com',
                password: 'admin123'
            });
            if (error) throw error;
            admin = data;
            console.log('[Verify] Admin signed in successfully.');
        }

        // 2. Elevate to admin
        console.log('[Verify] Elevating/Verifying admin role...');
        await elevateToAdmin(admin.user.id);

        // 3. Confirm role
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', admin.user.id)
            .single();

        if (userError) throw userError;
        console.log('[Verify] User role in database:', userData.role);

        if (userData.role !== 'admin') {
            console.error('[Verify] FAILED: User is NOT an admin.');
        } else {
            console.log('[Verify] SUCCESS: Admin user is ready.');
        }

    } catch (err) {
        console.error('[Verify] Error during verification:', err.message);
    }
}

if (require.main === module) {
    verify();
}
