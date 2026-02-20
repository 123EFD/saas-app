import { createClient } from '@supabase/supabase-js';
import {auth} from "@clerk/nextjs/server";

export const createSupabaseClient = async () => {
    const session = await auth();
    const token = await session.getToken({template: "supabase"});
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        }
    )
}