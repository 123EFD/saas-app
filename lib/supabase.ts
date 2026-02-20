
import { createClient } from '@supabase/supabase-js';
import { getServerSupabaseToken } from "@/lib/server/auth";

export const createSupabaseClient = async () => {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error("Missing SUPABASE URL or anon key in env");
    }

    try {
        const token = await getServerSupabaseToken();

        if (!token || typeof token !== "string" || token.split(".").length !== 3) {
            //fall back to anon client
            return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }

        return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });
    } catch (err) {
        //DO NOT rethrow — return anon client instead
        console.warn("createSupabaseClient: failed to obtain valid server token; falling back to anon client", err);
        return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
};