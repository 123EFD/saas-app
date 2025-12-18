"use client";

import { createNote, getNotes } from "@/lib/actions/note.actions";
import { auth } from "@clerk/nextjs/server";
import { useState } from "react";
import { Note } from "@/types";


export default function TestConnectionPage() {
    const [logs, setLogs] = useState<string>("Ready to test...");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");


    const handleFetch = async () => {
        setStatus("loading");
        setLogs("Fetching notes...");
        try {
            const data = await getNotes();
            setLogs(JSON.stringify(data, null, 2));
            setStatus("success");
        } catch (error:any) {
            setLogs(`Error: ${error.message}`);
            alert("Failed to fetch notes. Check console for details.");
        }
        setStatus("error");
    };

    const handleCreate = async () => {
        setStatus("loading");
        setLogs("Fetching notes...");
        try {
            const newNote = await createNote({
                title: "Test Note via Frontend",
                content: "This proves the connection works!",
                subject: "Integration Test"
            });
            setLogs(`Created:\n${JSON.stringify(newNote, null, 2)}`);
            setStatus("success");
        } catch (error:any) {
            setLogs(`Error: ${error.message}`);
            alert("Failed to create note. Check console for details.");
        }
        setStatus("error");
    };

    return (
    <div className="p-10 space-y-6">
        <h1 className="text-2xl font-bold">API Connection Test</h1>

        <div className="flex gap-4">
            <button 
            onClick={handleFetch}
            disabled={status === "loading"}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
            {status === "loading" ? "Wo..." : "Fetch All Notes"}
            </button>

            <button 
            onClick={handleCreate}
            disabled={status === "loading"}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
            Create Test Note
            </button>
        </div>

        <div className="space-y-2">
            <h2 className="text-xl font-semibold">Result Log:</h2>
            <div className={`p-4 rounded-lg overflow-auto max-h-[500px] text-sm font-mono border ${
                status === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-black text-green-400 border-gray-800"
            }`}>
                    <pre>{logs}</pre>
                </div>
            </div>
        </div>
    );
}