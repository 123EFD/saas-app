"use server"

import { createServiceSupabaseClient } from "@/lib/supabase-service";
import OpenAi, { OpenAI } from "openai";

if (typeof (global as any).DOMMatrix === "undefined") {
    (global as any).DOMMatrix = class DOMMatrix {
        constructor() {}
        static fromFloat32Array() { return new DOMMatrix(); }
        static fromFloat64Array() { return new DOMMatrix(); }
        toString() { return "[object DOMMatrix]"; }
    };
}

if (typeof (global as any).ImageData === "undefined") {
    (global as any).ImageData = class ImageData {
        data: any[] = [];
        width: number = 0;
        height: number = 0;
    };
}

if (typeof (global as any).Path2D === "undefined") {
    (global as any).Path2D = class Path2D {
        moveTo() {} lineTo() {} closePath() {} bezierCurveTo() {}
    };
}

export async function processChatAttachment(path: string, type: string) {
    try {
        let arrayBuffer: ArrayBuffer;
        if (path.startsWith("http")) {
            console.log("[FileProcess] Fetching file from URL:", path);
            const response  = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
            }
            arrayBuffer = await response.arrayBuffer();
        } else {
            const supabase = createServiceSupabaseClient();

            let cleanPath = path;
            if (cleanPath.startsWith("attachments/")) {
                cleanPath = cleanPath.replace("attachments/", "");
            } 

            if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
            console.log(`[FileProcess] Attempting to download from bucket 'attachments', exact path: '${cleanPath}'`);

            //download file from storage
            const { data: fileData, error: dlError } = await supabase.storage
                .from("attachments")
                .download(cleanPath);

            if (dlError || !fileData) {
                console.error("Could not download file from storage:", dlError?.message);
                return `[System Error: Failed to download file from storage: ${dlError?.message}]`;
            }

            arrayBuffer = await fileData.arrayBuffer();
        }

        console.log(`[FileProcess] File downloaded, size: ${arrayBuffer.byteLength} bytes`);

        if (type === "application/pdf") {
            try {
                const buffer = Buffer.from(arrayBuffer);
                const nodeRequire = eval("require");
                let parseFn = nodeRequire("pdf-parse");
                if (typeof parseFn !== "function" && typeof parseFn.default === "function") {
                    parseFn = parseFn.default;
                }

                if (typeof parseFn !== "function" && typeof parseFn.default === "function") {
                    throw new Error("Resolved pdf-parse is not a function.");
                }

                const parsed = await parseFn(buffer);
                console.log(`[FileProcess] PDF parsed successfully, length: ${parsed.text?.length}`);
                return parsed.text || "The PDF appears to be empty.";
            } catch (pdfError : any) {
                console.error("[FileProcess] PDF Parsing Error:", pdfError);
                return `[System: Error extracting text from PDF: ${pdfError.message}]`;
            }
        }

        //handle Image vision
        if (type.startsWith("image/")) {
            const groq = new OpenAi({
                apiKey: process.env.GROQ_API_KEY,
                baseURL: "https://api.groq.com/openai/v1",
            });

            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const dataUrl = `data:${type};base64,${base64}`;

            try {
                console.log("[FileProcess] Sending to Groq Vision...");
                const response = await groq.chat.completions.create({
                    model: "llama-3.2-11b-vision-preview",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Explain this image to a student. Identify key concepts, text, or diagrams." },
                                { type: "image_url", image_url: { url: dataUrl } }
                            ]
                        }
                    ],
                    temperature: 0.5,
                });

                const content = response.choices[0].message.content;
                console.log("[FileProcess] Groq Vision success");
                return content || "The AI could not describe this image.";

            } catch (visionError: any) {
                console.error("[FileProcess] Groq Vision error:", visionError);
                return `[System Error: Image analysis failed: ${visionError.message}]`;
            }
        }

        return `[System Error: Unsupported file type: ${type}]`;

    } catch (globalError: any) {
        console.error("[FileProcess] Global catch:", globalError);
        return `[System Error: ${globalError.message}]`;
    }
}