"use client";
//client wrapper for button/modal logic

import {useState} from "react";
import { Plus } from "lucide-react";
import NoteModal from "@/components/NoteModal";
import { createNote } from "@/lib/actions/note.actions";
import { CreateNoteParams } from "@/types";

interface Props {
    companionId: string;
    companionName:string;
    subject: string;
}

export default function SessionNoteWrapper({ companionId, companionName, subject }: Props) {
    const [isOpen, setIsOpen] = useState(false);


    const handleSave = async (data: CreateNoteParams) => {
        await createNote({
            ...data,
            companion_id: companionId,
            subject: data.subject === "General" ? subject: data.subject
        });

    };

    return (
        <>
        {/*Floating Action Button-UI element, remains static regardless of scrolling*/}
        <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 group"
            title="Take a note"
        >
            <Plus size={24} />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                Add Note
            </span>
        </button>

        <NoteModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSave={handleSave}
        />
        </>
    );
}