"use client";
//client wrapper for button/modal logic

import {useState} from "react";
import { Plus, Sparkles, Loader2  } from "lucide-react";
import NoteModal from "@/components/NoteModal";
import { createNote } from "@/lib/actions/note.actions";
import { generateChatSummary } from "@/lib/actions/ai.actions";
import { CreateNoteParams } from "@/types";

interface Props {
    companionId: string;
    companionName:string;
    subject: string;
    messages: any[];
}

export default function SessionNoteWrapper({ companionId, companionName, subject, messages }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const handleSave = async (data: CreateNoteParams) => {
        await createNote({
            ...data,
            companion_id: companionId,
            subject: data.subject === "General" ? subject: data.subject
        });
    };

    const handleGenerateSummary = async () => {
        if (messages.length === 0) return alert("No conversation to summarize.");
        setIsSummarizing(true);

        try {
            const summary = await generateChatSummary(messages, companionName);
            const confirmAdd = confirm(`Summary Generated:\n\n"${summary}"\n\nWould you like to add this directly to your "My Notes" section?`);
            if (confirmAdd) {
                await handleSave({
                    title: `Summary of ${companionName} Session`,
                    content: summary,
                    subject: subject
                });
            }
        } catch (error) {
            console.error("Summary failed:", error);
            alert("Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
        }
    }

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="size-14 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                    title="Take a note"
                    aria-label="Add Note"
                >
                    <Plus size={28} />
                </button>
                {/* Generate Summary Button */}
                <button
                    onClick={handleGenerateSummary}
                    disabled={isSummarizing}
                    className="size-14 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-50 shrink-0"
                    title="Generate AI Summary"
                    >
                    {isSummarizing ? <Loader2 size= {24} className="animate-spin"/> : <Sparkles size={24} />}
                    </button>
            </div>
        {/*Floating Action Button-UI element, remains static regardless of scrolling*/}
        {/* Existing Take a Note Button */}
        

        <NoteModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSave={handleSave}
            hideHeader
        />
        </>
    );
}