import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the Service Role key.
 * This MUST only be imported/used in server code.
 */
export const createServiceSupabaseClient = () => {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE URL or SERVICE ROLE KEY env vars");
    }

    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
};