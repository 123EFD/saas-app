"use client"
//Full note view with edit

import React, { useState, useEffect } from "react";
import { Note } from "@/types";
import { X, Edit2, Save, Trash2, Calendar, Check } from "lucide-react";
import ReactMarkdown from "react-markdown"; // Renders the markdown content

interface NoteViewModalProps {
    note: Note|null;
    isClick: boolean;
    onClose: () => void;
    // Partial means we can update just title, just content, etc.
    onUpdate: (id: number, data: Partial<Note>) => Promise<void>; 
    onDelete: (id: number) => Promise<void>;
}

export default function NoteViewModal({ 
    note, 
    isClick, 
    onClose, 
    onUpdate,
    onDelete 
}: NoteViewModalProps) {    // State for Dual-Mode
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: "", content: "", subject: "" });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (note) {
            setEditForm({
                title: note.title, 
                content: note.content, 
                subject: note.subject 
            });
            setIsEditing(false);
        }
    },[note]);
    
    if (!isClick || !note) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(note.id, editForm);
            setIsEditing(false); // Switch back to view mode on success
        } catch (error) {
            console.error("Failed to update", error);
        } finally {
            setIsSaving(false);
        }
    };


    const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this note? This cannot be undone.")) {
            await onDelete(note.id);
            onClose(); // Close modal after delete
        }
    };

    const subjects = ["General", "Maths", "Science", "Chemistry", "History", "Coding"];

    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            
            {/*Modal container*/}
            <div
                className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/*HEADER*/}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {/*Subject using short-circuit evaluation/conditional rendering (declarative)*/}
                        {!isEditing && (
                            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                {note.subject}
                            </span>
                        )}
                        {isEditing && (
                            <select
                                value={editForm.subject}
                                onChange={(e) => setEditForm({...editForm,subject: e.target.value})}
                                className="text-sm border rounded px-2 py-1 outline-none"
                                aria-label="Select subject"
                            >
                                {subjects.map(subj => (
                                    <option key={subj} value={subj}>{subj}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" title="Edit">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                                    <Trash2 size={18} />
                                </button>
                            </>
                        ):(
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                                {isSaving ? "Saving..." : <> <Check size={16}></Check> Save Changes</>}
                            </button>
                        )}
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors" title="Close">
                            <X scale={20} />
                        </button>
                    </div>
            </div>

            {/*Content: Scrollable*/}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/*Title*/}
                <div className="mb-6">
                    {isEditing ?(
                        <input
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="text-3xl font-bold w-full border-b border-gray-200 pb-2 focus:border-blue-500 focus:outline-none"
                            placeholder="Note Title"
                        />
                    ):(
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                            {note.title}
                        </h1>
                    )}

                    <div className="flex items-center text-gray-400 text-sm mt-3">
                        <Calendar size={14} className="mr-2"/>
                        {new Date(note.created_at).toLocaleDateString()}
                        <span className="mx-2">•</span>
                        {note.content.length} characters
                    </div>
                </div>

                {/* Body Section */}
                {isEditing ? (
                    <textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        className="w-full h-full min-h-[300px] text-base leading-relaxed text-gray-700 resize-none outline-none font-mono"
                        placeholder="Start typing..."
                    />
                ) : (
                    //markdown rendered
                    <article className="prose prose-slate max-w-none">
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                    </article>
                )}
            </div>
        </div>
    </div>
    );
}