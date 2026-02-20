"use server";

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .insert({...formData, author })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    return data[0];
};

export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
    const supabase = createSupabaseClient();
    const { userId } = await auth();

    let query = supabase.from('companions').
        select('*')
        .eq('author', userId);

    if(subject && topic) {
        query = query.ilike('subject', `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    } else if(subject) {
        query = query.ilike('subject', `%${subject}%`)
    } else if(topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: companions, error } = await query;

    if(error) throw new Error(error.message);
    if(!companions) return [];

    // If user is not logged in, return companions with bookmarked: false
    if(!userId) {
        return companions.map(companion => ({ ...companion, bookmarked: false }));
    }

    const companionIds = companions.map(c => c.id);

    const { data: bookmarksData, error: bookmarkError } = await supabase
        .from("bookmarks")
        .select("companion_id")
        .eq("user_id", userId)
        .in("companion_id", companionIds);

    if (bookmarkError) throw new Error(bookmarkError.message);

    const bookmarkedIds = new Set(bookmarksData?.map(b => b.companion_id));

    return companions.map(companion => ({
        ...companion,
        bookmarked: bookmarkedIds.has(companion.id),
    }));

};
export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('id', id);

    if(error) return console.log(error);

    return data[0];
};

export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from('session_history')
        .insert({
            companion_id: companionId,
            user_id: userId,
        })

    if(error) throw new Error(error.message);

    return data;
}

export const getRecentSessions = async (limit = 10, userId?:string) => {
    const supabase = createSupabaseClient();
    if (!userId) {
        return [];
    }
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if(error) throw new Error(error.message);
    const result = (data || [])
        .filter((row:any) => row && row.companions)//remove null companions
        .map(({companions } : any) => companions);
    return result;
};



// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
    const { userId } = await auth();
    if (!userId) return;
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from("bookmarks").insert({
        companion_id: companionId,
        user_id: userId,
    });
    if (error) {
        throw new Error(error.message);
    }
    // Revalidate the path to force a re-render of the page

    revalidatePath(path);
    return data;
    };

    export const removeBookmark = async (companionId: string, path: string) => {
    const { userId } = await auth();
    if (!userId) return;
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("companion_id", companionId)
        .eq("user_id", userId);
        
    if (error) {
        throw new Error(error.message);
    }
    revalidatePath(path);
    return data;
    };

    export const deleteCompanion = async (id: string, path?: string) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    // Delete the companion
    const { error: deleteError } = await supabase
        .from("companions")
        .delete()
        .eq("id", id)
        .eq("author", userId);

    if (deleteError) throw new Error(deleteError.message);

    if (path) revalidatePath(path);

    return { success: true };
};

    // It's almost the same as getUserCompanions, but it's for the bookmarked companions
    export const getBookmarkedCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("bookmarks")
        .select(`companions:companion_id (*)`) // Notice the (*) to get all the companion data
        .eq("user_id", userId);
    if (error) {
        throw new Error(error.message);
    };
    // We don't need the bookmarks data, so we return only the companions
    if (!data) return [];

    // Transform the data to include the bookmarked status
    return data.map(({ companions }) => ({
        ...companions,
        bookmarked: true // Since these are from bookmarks, they're all bookmarked
    }));
}
