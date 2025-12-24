"use client";
//Notes list container
import { Note } from "@/types";
import NoteCard from "./NoteCard";
import { Ghost } from "lucide-react"; // npm install lucide-react

interface NotesListProps {
    notes: Note[];
    onOpenNote: (note: Note) => void;
    onDeleteNote: (id: number) => Promise<void>;
    onBookmarkNote: (id: number) => Promise<void>;
}

export default function NotesList({ 
    notes, 
    onOpenNote, 
    onDeleteNote, 
    onBookmarkNote 
}: NotesListProps) {

    //handling empty state and show notifications if it is empty
    if (!notes || notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <Ghost className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No notes found</h3>
                <p className="text-gray-500 max-w-xs mt-1">
                    Your collection is empty. Click the + button to create your first note.
                </p>
            </div>
        );
    }

    //grid layout using CSS grid
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {notes.map((note) => (
                <NoteCard
                key={note.id}           // React needs a unique key for list performance
                note={note}             // Pass the data down
                onClick={onOpenNote}     // Pass the "View" action
                onDelete={onDeleteNote} // Pass the "Delete" action
                onBookmark={onBookmarkNote} // Pass the "Bookmark" action
                />
            ))}
        </div>
    );
}