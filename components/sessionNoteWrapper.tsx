"use client";
//client wrapper for button/modal logic

import {useState} from "react";
import { Plus, Sparkles, Loader2, X, FileText, Check } from "lucide-react";
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
    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState("");

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
            setGeneratedSummary(summary);
            setIsSummaryOpen(true);
        } catch (error) {
            console.error("Summary failed:", error);
            alert("Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleAddToNotes = async () => {
        await handleSave({
            title: `Summary: Session with ${companionName}`,
            subject: subject,
            content: generatedSummary
        });
        setIsSummaryOpen(false);
        alert("Added to your journey!");
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
                <button
                    onClick={() => setIsNoteOpen(true)}
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

            {isSummaryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                                <Sparkles size={20} />
                                <h2 className="font-bold text-lg">AI Session Summary</h2>
                            </div>
                            <button onClick={() => setIsSummaryOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors" title="Close summary" aria-label="Close summary">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed italic">
                                    {generatedSummary}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex gap-3">
                            <button 
                                onClick={handleAddToNotes}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                            >
                                <Check size={18} />
                                Add to My Notes
                            </button>
                            <button 
                                onClick={() => setIsSummaryOpen(false)}
                                className="px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        {/*Floating Action Button-UI element, remains static regardless of scrolling*/}
        {/* Existing Take a Note Button */}
        

        <NoteModal
            isOpen={isNoteOpen}
            onClose={() => setIsNoteOpen(false)}
            onSave={handleSave}
            hideHeader
        />
        </>
    );
}