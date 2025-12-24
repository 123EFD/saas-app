//Note card in grid
"use client";

import { Note } from "@/types";
import { Trash2,Bookmark, Calendar } from "lucide-react";

interface NoteCardProps {
    note:Note;
    onDelete: (id: number) => void;
    onBookmark: (id: number) => void;
    onClick: (id: Note) => void;
}

export default function NoteCard({note, onDelete, onBookmark, onClick}: NoteCardProps) {
    const formatDate = (timeStamp: number) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(timeStamp));
    };

    return (
        <div
            onClick={() => onClick(note)}
            className="group relative bg-white border border-l-amber-400 roundedxl p-5 shadow-sm 
            hover:shadow-md hover:border-b-blue-300 transition-all cursor-pointer flex flex-col h-[220px]"
        >
            {/*Subject badge & bookmark*/}
            <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    {note.subject}
                </span>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBookmark(note.id);
                    }}
                    className={`p-1.5 rounded full transition-colors ${
                        note.bookmarked
                            ? "text-yellow-500 bg-red-300 hover:bg-pink-300"
                            : "text-indigo-400 hover:bg-red-400 hover:text-blue-400"
                        }`}
                    >
                        {/*Fill icon if bookmarked*/}
                        <Bookmark size={18} fill={note.bookmarked ? "currentColor" : "none"}></Bookmark>
                    </button>
            </div>

            {/* Title & Preview */}
            <h3 className="font-bold text-neutral-600 text-lg mb-2 truncate pr-4">
                {note.title}
            </h3>

            <p className="text-shadow-blue-200 text-sm line-clamp-3 flex-grow leading-relaxed">
                {note.content}
            </p>

            {/* FOOTER: Date & Delete */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-500">
                <div className="flex items-center text-gray-400 text-xs font-medium">
                    <Calendar size={12} className="mr-1.5"/>
                    {formatDate(Number(note.created_at))}
                </div>

                <button
                   type="button"
                   title="Delete note"
                   onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this note?")) onDelete(note.id);
                   }}
                   className="text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                   aria-label="Delete note"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
