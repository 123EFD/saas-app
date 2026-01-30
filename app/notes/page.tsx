"use client";
//Main notes list page

import { useState, useEffect } from "react";
import { getNotes, updateNote, deleteNote, toggleBookmark } from "@/lib/actions/note.actions";
import { Note } from "@/types";
import NotesList from "@/components/NotesList";
import NoteViewModal from "@/components/NoteViewModal";
import { Search, Filter } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function normalize(input: unknown): Note[] {
    if (Array.isArray(input)) return input;
    // @ts-expect-error
    if (Array.isArray(input?.items)) return input.items;
    // @ts-expect-error
    if (Array.isArray(input?.data)) return input.data;
    return [];
}

export default function NotesPage() {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();

    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);//an array of "Note" objects
    const [selectedNote, setSelectedNote] = useState<Note | null>(null); //union type 

    const [searchQuery, setSearchQuery] = useState("");
    const [filterSubject, setFilterSubject] = useState("All");
    const [isLoading, setIsLoading] = useState(false);

    // Redirect to sign-in if not authorized
    useEffect(() => {
        if(isLoaded && !userId) {
            router.push("/sign-in");
        }
    }, [isLoaded, userId, router]);

    useEffect(() => {
        const loadNotes = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const raw = await getNotes();
                const data = normalize(raw);
                setNotes(data);
                setFilteredNotes(data);
            } catch (error) {
                console.error("[Notes Page] Error loading notes:", error);
                // Optionally set error state here if UI supports it
                setNotes([]);
                setFilteredNotes([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoaded && userId) {
            loadNotes();
        }
    }, [isLoaded, userId]);

    //filtering logic (runs whenever query/subject/notes change)
    useEffect(() => {
        const list = Array.isArray(notes) ? notes : normalize(notes as unknown);
        let result = list;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(n =>
                n.title.toLowerCase().includes(lowerQuery) ||
                n.content.toLowerCase().includes(lowerQuery)
            );
        }

        //subject filter
        if (filterSubject !== "All") {
            result = result.filter((n) => n.subject === filterSubject);
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

    const subjects = ["General", "Maths", "Science", "Chemistry", "History", "Coding", "Language", "Economics"];

    //prevent rendering content while checking auth
    if (!isLoaded || !userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Notes</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage and review your study materials</p>
                    </div>
                    {/* Search & Filter Controls */}
                    <div className="flex gap-3 w-full md:w-auto"></div>
                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-grow md:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-indigo-500 outline-none
                                            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                                            border-gray-300 dark:border-gray-700
                                            placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>

                        {/*Filter Dropdown*/}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400" size={18} />
                            <select
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="pl-10 pr-8 py-2 border rounded-lg appearance-none bg-white dark:bg-gray-900
                                            text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer
                                            border-gray-300 dark:border-gray-700"
                                aria-label="Filter by Subject"
                            >
                                {subjects.map(subj => (
                                    <option key={subj} value={subj}>{subj}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading indicator */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    </div>
                ) : (
                    <NotesList
                        notes={filteredNotes}
                        onOpenNote={setSelectedNote}
                        onDeleteNote={handleDelete}
                        onBookmarkNote={handleBookmark}
                    />
                )}

                <NoteViewModal
                    isClick={!!selectedNote}
                    note={selectedNote}
                    onClose={() => setSelectedNote(null)}
                    onUpdate={async (id, data) => {
                        await updateNote(id, data);
                        // Refresh list after update
                        const raw = await getNotes();
                        const normalized = normalize(raw);
                        setNotes(normalized);
                    }}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}