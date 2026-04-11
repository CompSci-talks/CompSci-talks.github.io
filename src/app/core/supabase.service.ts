import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            environment.supabase.url,
            environment.supabase.key,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                },
                global: {
                    fetch: (url, options) => {
                        return Promise.race([
                            fetch(url, options),
                            new Promise<Response>((_, reject) =>
                                setTimeout(() => reject(new Error('Supabase Fetch Timeout')), 8000)
                            )
                        ]);
                    }
                }
            }
        );
    }

    get client(): SupabaseClient {
        return this.supabase;
    }
}
