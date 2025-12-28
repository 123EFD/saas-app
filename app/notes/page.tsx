"use client";
//Main notes list page

import { useState, useEffect } from "react";
import { getNotes, updateNote, deleteNote, toggleBookmark } from "@/lib/actions/note.actions";
import { Note } from "@/types";
import NotesList from "@/components/NotesList";
import NoteViewModal from "@/components/NoteViewModal";
import { Search, Filter } from "lucide-react";

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);//an array of "Note" objects
    const [selectedNote, setSelectedNote] = useState<Note | null>(null); //union type 

    const [searchQuery, setSearchQuery] = useState("");
    const [filterSubject, setFilterSubject] = useState("All");

    useEffect(() => {
        const loadNotes = async () => {
            const data = await getNotes();
            setNotes(data);
            setFilteredNotes(data);
        };
        loadNotes();
    }, []);

    //filtering logic (runs whenever query/subject/notes change)
    useEffect(() => {
        let result = notes;
    
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(n => 
                n.title.toLowerCase().includes(lowerQuery) || 
                n.content.toLowerCase().includes(lowerQuery)
            );
        }

        //subject filter
        if (filterSubject !== "All") {
            result = result.filter(n => n.subject === filterSubject);
        }

            setFilteredNotes(result);
        }, [searchQuery, filterSubject, notes]);
    
        const handleDelete = async (id: number) => {
            setNotes(prev => prev.filter(n => n.id !== id));
            await deleteNote(id);
        }; 

        const handleBookmark = async (id: number) => {
            setNotes(prev => prev.map(n => n.id === id ? { ...n, bookmarked: !n.bookmarked } : n));
            await toggleBookmark(id);
        };

        const subjects = ["General", "Maths", "Science", "Chemistry", "History", "Coding","Language","Economics"];

        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header & Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">My Notes</h1>
                            <p className="text-slate-500">Manage and review your study materials</p>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {/* Search Input */}
                            <div className="relative flex-grow md:flex-grow-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search notes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            {/*Filter Dropdown*/}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    value={filterSubject}
                                    onChange={(e) => setFilterSubject(e.target.value)}
                                    className="pl-10 pr-8 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"   
                                    aria-label="Filter by subject"     
                                >
                                    {subjects.map(subj => (
                                    <option key={subj} value={subj}>{subj}</option>
                                ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <NotesList 
                        notes={filteredNotes} 
                        onOpenNote={setSelectedNote}
                        onDeleteNote={handleDelete}
                        onBookmarkNote={handleBookmark}
                    />

                    <NoteViewModal
                        isClick={!!selectedNote}
                        note={selectedNote}
                        onClose={() => setSelectedNote(null)}
                        onUpdate={async (id, data) => {
                            await updateNote(id, data);
                            // Refresh list after update
                            const updated = await getNotes();
                            setNotes(updated);
                    }}
                    onDelete={handleDelete}
                    />
                </div>
            </div>
        );
    }