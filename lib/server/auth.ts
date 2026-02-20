import { auth } from "@clerk/nextjs/server";
export async function getServerUserId(): Promise<string | null> {
    try {
        const a = await auth();
        // Clerk's auth object shape can vary; check for userId or user.id
        const userId = (a as any)?.userId ?? (a as any)?.user?.id ?? null;
        return typeof userId === "string" ? userId : null;
    } catch (err) {
        console.warn("getServerUserId: auth() failed or returned no user - treating as anon", err);
        return null;
    }
}