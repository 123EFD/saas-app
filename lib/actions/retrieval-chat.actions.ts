"use server";
export const dynamic = 'force-dynamic';
import { retrieveRelevantChunks } from "@/lib/actions/embeddings.actions";
import { createSupabaseClient } from "@/lib/supabase";
// import OpenAI from "openai"; // uncomment if using OpenAI

// Example: HF text generation helper
async function generateWithHf(prompt: string, model = "gpt2") {
    // NOTE: pick a HF model available for generation in your account (e.g. "tiiuae/falcon-7b-instruct" if available)
    const HF_KEY = process.env.HUGGINGFACE_API_KEY;
    if (!HF_KEY) throw new Error("Missing HUGGINGFACE_API_KEY for generation");

    const res = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${HF_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 512,
                do_sample: false,
            },
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HF generation failed: ${res.status} ${text}`);
    }
    const json = await res.json();

    if (Array.isArray(json) && json[0]?.generated_text) return json[0].generated_text;
    if (json.generated_text) return json.generated_text;
    if (json[0]?.generated_text) return json[0].generated_text;
    // some models return an array 'generated_text' inside the first item
    return JSON.stringify(json).slice(0, 1000);
}

/**
 * Server action invoked by client to ask a companion a question:
 * - retrieves relevant chunks
 * - builds context + prompt
 * - calls LLM
 * - returns assistant text
 */
export async function askCompanionUsingRetrieval(companionId: string, userQuestion: string) {
    // 1) fetch companion metadata if needed
    const supabase = await createSupabaseClient();
    const { data: compRows } = await supabase.from("companions").select("*").eq("id", companionId).limit(1);
    const companion = compRows?.[0];
    if (!companion) throw new Error("Companion not found");

    // 2) retrieve top chunks
    const topChunks = await retrieveRelevantChunks(companionId, userQuestion, 5);

    // 3) build context (join top chunks)
    const context = topChunks.map((c, i) => `Chunk ${i + 1}:\n${c.content}`).join("\n\n---\n\n");

    // 4) build prompt
    const system = `You are ${companion.name}, a ${companion.subject} tutor. Use the provided document excerpts (below) as the primary source of truth. Answer concisely and reference the document when possible.`;
    const prompt = `${system}\n\nDOCUMENT EXCERPTS:\n${context}\n\nUSER QUESTION:\n${userQuestion}\n\nANSWER:`;

    // 5) call LLM (OpenAI example commented out; using HF generation as fallback)
    const assistantText = await generateWithHf(prompt, "gpt2"); // replace with available HF model

    // 6) Optionally log the interaction (session_history etc.)
    return assistantText;
}

