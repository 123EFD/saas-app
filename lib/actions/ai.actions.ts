"use server";

export const dynamic = "force-dynamic";
import OpenAi from "openai";

export async function generateChatSummary(messages: any[], companionName: string) {
    const groq = new OpenAi({
    apiKey: process.env.GROQ_API_KEY, 
    baseURL: "https://api.groq.com/openai/v1",
})

    if (!messages || messages.length === 0 ) return "No conversation to summarize."; 
    /// 1. Format the transcript so the AI understands who said what
    // Note: 'messages' is newest-first in your code, so we reverse it for chronological order
    const transcript = [...messages]
        .reverse() //latest messages
        .map(m => {
            const role = m.role === 'assistant' ? companionName : 'Student';
            const content = m.content || "(No content)";
            return `${role}: ${content}`;
        })
        .join("\n");

    console.log("Generating summary for transcript:", transcript);
                    
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "assistant",
                    content: `You are a helpful assistant that summarizes conversations between a student and ${companionName}.
                    Focus on the key points discussed, the student's questions,
                    and the explanations provided. Keep the summary concise and informative.Use bullet points for key takeaways. Keep it under 150 words.`
                },
                {
                    role: "user",
                    content: `Here is the session transcript:\n\n${transcript}`
                }
            ],
            temperature: 0.7,
        });

        const summary = response.choices[0].message.content;
        if (!summary) {
            console.error("Groq returned an empty response choice.");
            return "AI returned an empty summary. Check your transcript content.";
        }

        return summary;
    }
    catch (error: any) {
        //debugging purpose only 
        console.error("DETAILED Groq ERROR:", error.message || error);
        if (error.status === 401) return "Error: Invalid Groq API Key.";
        if (error.status === 429) return "Error: Groq Quota exceeded (Check your billing).";
        
        return `Error: ${error.message || "Failed to generate AI summary."}`;
    }
}
