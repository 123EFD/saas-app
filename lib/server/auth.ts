import { auth } from "@clerk/nextjs/server";

export async function getServerUserId(): Promise<string | null> {
    try {
        const { userId } = await auth();
        return typeof userId === "string" ? userId : null;
    } catch (err) {
        console.warn("getServerUserId: auth() failed or returned no user - treating as anon", err);
        return null;
    }
}

export async function getServerSupabaseToken(): Promise<string | null> {
    try {
        const a = await auth();
        if (!a || typeof (a as any).getToken !== "function") {
            return null;
        }
        const token = await (a as any).getToken({ template: "supabase" });
        if (!token || typeof token !== "string" || token.split(".").length !== 3) {
            return null;
        }
        return token;
    } catch (err) {
        console.warn("getServerSupabaseToken: failed to obtain token; returning null", err);
        return null;
    }
}