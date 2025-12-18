"use client";
import { createNote, getNotes } from "@/lib/actions/note.actions";
import { auth } from "@clerk/nextjs/server";
import { useState } from "react";
import { Note } from "@/types";


export default async function TestConnectionPage() {
    const [notes,setNotes]=  useState<Note[]>([]); //anarray of notes
    const [loading, setLoading] = useState(false);

    const handleFetch = async () => {
        setLoading(true);
        try {
            const data = await getNotes();
            setNotes(data);
        } catch (error) {
            console.error("Error fetching notes:", error);
            alert("Failed to fetch notes. Check console for details.");
        }
        setLoading(false);
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            await createNote({
                title: "Test Note via Frontend",
                content: "This proves the connection works!",
                subject: "Integration Test"
            });
            alert("Note created successfully!");
            handleFetch(); // Refresh notes
        } catch (error) {
            console.error("Error creating note:", error);
            alert("Failed to create note. Check console for details.");
        }
        setLoading(false);
    };

    return (
    <div className="p-10 space-y-6">
        <h1 className="text-2xl font-bold">API Connection Test</h1>

        <div className="flex gap-4">
            <button 
            onClick={handleFetch}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
            {loading ? "Loading..." : "Fetch All Notes"}
            </button>

            <button 
            onClick={handleCreate}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
            Create Test Note
            </button>
        </div>

        <div className="border p-4 rounded bg-gray-50 min-h-[200px]">
            <h2 className="font-semibold mb-2">Results:</h2>
            
            {notes.length === 0 ? (
                <p className="text-gray-500">No notes fetched yet.</p>
            ) : (
            <ul className="space-y-2">
                {/* TypeScript now knows 'note' has an .id and .title */}
                {notes.map((note) => (
                <li key={note.id} className="p-3 bg-white border rounded shadow-sm">
                    <span className="font-bold text-blue-600">[{note.subject}]</span> {note.title}
                    <div className="text-xs text-gray-400 mt-1">ID: {note.id}</div>
                </li>
                ))}
            </ul>
            )}
        </div>
        </div>
    );
}