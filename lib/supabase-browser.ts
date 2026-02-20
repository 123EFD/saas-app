import { createClient } from '@supabase/supabase-js';

// This client is safe for use in "use client" components
export const createBrowserSupabaseClient = (clerkToken: string) => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: clerkToken ? {
                    Authorization: `Bearer ${clerkToken}`} : undefined,
                },
        },
    );
};