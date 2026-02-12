"use server";

import { createXanoClient } from "@/lib/xano";

export async function generateChatSummary(messages: any[], companionName: string) {
    
    const transcript = messages
                        .reverse() //latest messages
                        .map(m => `${m.role === 'assistant' ? companionName : 'Student'}: ${m.content}`)
                        .join("\n");

        return `During this session with ${companionName}, we discussed the key concepts of the topic. The student explored the fundamental principles and clarified doubts regarding specific technical details.`;
        //this line need to improve in the future
        
}
