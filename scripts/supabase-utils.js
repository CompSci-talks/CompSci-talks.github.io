const { createClient } = require('@supabase/supabase-js');

let clientInstance = null;

async function getClient() {
    if (clientInstance) return clientInstance;

    // These should ideally be in environment variables, but for local utility scripts we source them directly
    const supabaseUrl = 'https://kxxgeprqldabbjmbtajl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eGdlcHJxbGRhYmJqbWJ0YWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDM2NTIsImV4cCI6MjA4ODgxOTY1Mn0.R1l1IPduyUvb5BTD5OsbuoqD0DrBraE768_4MnAfNEc';
    clientInstance = createClient(supabaseUrl, supabaseKey);
    return clientInstance;
}

/**
 * Creates a test user and returns the session
 */
async function createTestUser(email, password, displayName = 'Test User') {
    const supabase = await getClient();
    console.log(`[Utils] Creating user: ${email}...`);
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } }
    });
    if (error) throw error;

    // Check if auto-login happened
    if (!data.session) {
        console.log(`[Utils] User created but no session. Signing in...`);
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        return signInData;
    }
    return data;
}

/**
 * Set a user's role to 'admin' using the public.users update policy
 * Requires an active user session
 */
async function elevateToAdmin(userId) {
    const supabase = await getClient();
    console.log(`[Utils] Elevating user ${userId} to admin...`);
    const { data, error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select();
    if (error) throw error;
    return data;
}

/**
 * Utility to create a test seminar
 */
async function createSeminar(title = 'Seminar Title', abstract = 'Abstract...') {
    const supabase = await getClient();
    const { data, error } = await supabase
        .from('seminars')
        .insert({
            title,
            location: 'Virtual',
            date_time: new Date().toISOString(),
            abstract
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

module.exports = {
    getClient,
    createTestUser,
    elevateToAdmin,
    createSeminar
};
