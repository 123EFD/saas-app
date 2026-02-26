"use server"

import { createServiceSupabaseClient } from "@/lib/supabase-service";
import OpenAi, { OpenAI } from "openai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function processChatAttachment(path: string, type: string) {
    const supabase = createServiceSupabaseClient();

    //download file from storage
    const { data: fileData, error } = await supabase.storage
        .from("attachments")
        .download(path);

    if (error || !fileData) {
        throw new Error("Could not download file from storage");
    }

    if (type === "application/pdf") {
        const arrayBuffer = await fileData?.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const parsed = await pdfParse(buffer);
        return parsed.text || "The PDF appears to be empty.";
    }

    //handle Image vision
    if (type.startsWith("image/")) {
        const groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
        });

        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const response = await groq.chat.completions.create({
            model : "llama-3.2-11b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: "Describe this image in detail, including any text or key features, so an AI tutor can use this information to help a student." 
                        },
                        { 
                            type: "image_url", 
                            image_url: { url: `data:${type};base64,${base64}` } 
                        }
                    ]
                }
            ]
        });

        return response.choices[0].message.content || "Could not describe the image";
    } 

    return "Unsupported file type";
}