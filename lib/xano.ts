"use server";
/*API Client

POST   /notes (create)
□ Xano table created with correct schema
□ POST /notes creates new note
□ GET /notes returns all user's notes
□ GET /notes/:id returns single note
□ PUT /notes/:id updates note
□ DELETE /notes/:id removes note
□ PATCH /notes/:id/bookmark toggles bookmark
□ Authentication works (user_id filtering)

*/

import { auth } from "@clerk/nextjs/server";
import { Rss } from "lucide-react";

const XANO_API_URL = process.env.NEXT_PUBLIC_XANO_API_URL!;

export async function createXanoClient() {
    const { userId, getToken } = await auth();

    if (!userId) {
        throw new Error("User unauthorized: No Clerk useer");
    }

    //generate JWT
    let token: string | null = null;
    try {
        token = await getToken();
    } catch (error) {
        token  = null;
    }

    //helper function to wraps fetch command but pre-fills headers
    async function request<T = any>(endpoint:string, init: RequestInit = {}): Promise<T> {
        const url =  `${XANO_API_URL}${endpoint}`;
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(init.headers as Record<string, string> || {}),// Merge in any extra headers passed to the function
    };

        //Authentication logic:
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        } else {
            headers["x-clerk-user-id"] = userId as string;
        }

        console.log("--------------------------------");
        console.log("🔍 DEBUG FETCHING URL:", url);
        console.log("--------------------------------");

        //network request
        const res = await fetch(url, {
            ...init,//pass GET POST, body etc.
            headers,
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Xano request failed [${res.status}] ${text}`);
        }

        if (res.status === 204) {
            return null as unknown as T;//no content
        }

        return res.json() as Promise<T>;
    }

    return {request, userId: userId as string, token};
}