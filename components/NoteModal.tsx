// Create/edit note modal
"use client";

import { useState } from "react";
import { X, Loader2} from "lucide-react";
import {CreateNoteParams} from "@/types";

interface NoteModalProps {
    isOpen:boolean;
    onClose: () => void;
    onSave: (data: CreateNoteParams) => Promise<void>; //wait for server
    hideHeader?: boolean;
}

export default function NoteModal({isOpen, onClose, onSave, hideHeader} : NoteModalProps) {
    //initial state
    const [formData, setFormData] = useState<CreateNoteParams>({
        title: "",
        content: "",
        subject: "General",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if(!isOpen) return null;

    //generic change handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    //submit handler 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); //Stop page reload
        setIsSubmitting(true);
        try {
            await onSave(formData);//reset form on Success
            setFormData({title: "", content:"", subject:"General"});
            onClose()
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        //to close the modal
        <div className="fixed inset-0 z-50 flex items-center 
        justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onAbort={onClose}>
            
            {/*this one dont close*/}
            <div
                className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl 
                overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                role="dialog"    
            >
                {/*Header*/}
                {!hideHeader && (
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-indigo-600">Create New Note</h2>
                        <button type="button" onClick={onClose} aria-label="Close modal" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                )}
                

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Row 1: Title & Subject */}
                    <div className="grid gird-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="What's on your mind?"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none
                                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                                placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="subject" className="text-xs font-semibold text-gray-500 uppercase">Subject</label>
                            <select
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none
                                        bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            >
                                <option value="General">General</option>
                                <option value="Maths">Maths</option>
                                <option value="Science">Science</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="History">History</option>
                                <option value="Coding">Coding</option>
                                <option value="Economic">Economic</option>
                                <option value="Finance">finance</option>
                                <option value="Business">business</option>
                                <option value="Language">language</option>
                                <option value="Geography">geography</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Content (Markdown Area) */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Content (Markdown supported)</label>
                        <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="# Notes\n- Point 1\n- Point 2"
                        className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm leading-relaxed
                         bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                         placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        required
                        />
                    </div>

                    {/* FOOTER: Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg 
                            transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                            {isSubmitting ? "Saving..." : "Save Note"}
                        </button>
                    </div>
                </form>
        </div>
    </div>
    );
}

