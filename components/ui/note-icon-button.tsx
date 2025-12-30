"use client";
/*Floating note button,trigger the creation flow*/

import { Plus } from "lucide-react";

interface Props {
    onClick: () => void;
}

export default function NoteIconButton({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium"
            aria-label="Create new note"
        >
            <Plus size={20} />
            <span>New Note</span>
        </button>
    );
}