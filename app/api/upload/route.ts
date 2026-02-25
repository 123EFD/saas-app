import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        // parse form data from request
        const form = await req.formData();
        const file = form.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Server-side Supabase client using SERVICE ROLE key (server-only env var)
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Missing Supabase service role key or URL env vars");
            return NextResponse.json(
                { error: "Server misconfiguration" },
                { status: 500 },
            );
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const fileExt = (file.name || "file").split(".").pop() || "bin";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `companion-attachments/${fileName}`;

        // Convert web File to buffer
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const { data, error } = await supabase.storage
            .from("attachments")
            .upload(filePath, uint8Array, {
                contentType: file.type || "application/octet-stream",
            });

        if (error) {
            console.error("Supabase storage error:", error);
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ path: filePath, data }, { status: 200 });
    } catch (err: any) {
        console.error("Upload route error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
