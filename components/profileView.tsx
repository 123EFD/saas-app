"use client";

//hold the state logic and existing UI layout

import { useState } from "react";
import Image from "next/image";
import { User } from "@clerk/nextjs/server"; // Or relevant type
import { Note, CreateNoteParams } from "@/types";
import { 
    createNote, 
    updateNote, 
    deleteNote, 
    toggleBookmark 
} from "@/lib/actions/note.actions";

//UI Components
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,    
} from "@/components/ui/accordion";

import CompanionsList from "@/components/CompanionsList"; // Your existing list
import NotesList from "@/components/NotesList";
import NoteModal from "@/components/NoteModal";
import NoteViewModal from "@/components/NoteViewModal";
import NoteIconButton from "@/components/ui/note-icon-button";

interface ProfileViewProps {
    user: any; // Ideally user type from Clerk
    companions: any[];
    sessionHistory: any[];
    bookmarkedCompanions: any[];
    initialNotes: unknown;
}

function toNoteArray(input: unknown): Note[] {
    if (Array.isArray(input)) return input;
    // common API shapes (adjust as needed)
    // @ts-expect-error: runtime guards
    if (Array.isArray(input?.items)) return input.items;
    // @ts-expect-error: runtime guards
    if (Array.isArray(input?.data)) return input.data;
    return [];
}

export default function ProfileView({
    user,
    companions,
    sessionHistory,
    bookmarkedCompanions,
    initialNotes    
} : ProfileViewProps) {
    const [notes, setNotes] = useState<Note[]>(toNoteArray(initialNotes)); //array for objects
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const handleCreateNote = async (data: CreateNoteParams) => {
        try {
            const newNote = await createNote(data);
            /*functional state update ensure the latest state during state updates,
            [newNote, ...prev] unpacks all the existing notes from the current state, then add the newNote
            at the top
            */
            setNotes((prev) => [newNote, ...prev]); 
        } catch (error) {
            alert("Failed to create note");
        }
    };

    const handleUpdateNote = async (id: number, data: Partial<Note>) => {
        try {
            const updated = await updateNote(id, data);
            setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
        } catch (error) {
            alert("Failed to update note");
        }
    };

    const handleDeleteNote = async (id: number) => {
        try {
            await deleteNote(id);
            setNotes((prev) => prev.filter((n) => n.id !== id));
            setSelectedNote(null);
        } catch (error) {
            alert("Failed to delete note");
        }
    };

    const handleBookmarkNote = async (id:number) => {
        try {
            const updated = await toggleBookmark(id);
            setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
        } catch (error) {
            alert("Failed to bookmark note");
        }
    };
    return (
        <main className="min-lg:w-3/4">
            <section className="flex justify-between gap-4 max-sm:flex-col items-center">
                <div className="flex gap-4 items-center">
                    <Image
                        src={user.imageUrl}
                        alt={user.firstName!}
                        width={110}
                        height={110}
                    />
                    <div className="flex flex-col gap-2">
                        <h1 className="font-bold text-2xl">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {user.emailAddresses[0].emailAddress}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="border border-black rouded-lg p-3 gap-2 flex flex-col h-fit">
                        <div className="flex gap-2 items-center">
                            <Image
                                src="/icons/check.svg"
                                alt="checkmark"
                                width={22}
                                height={22}
                            />
                            <p className="text-2xl font-bold">{sessionHistory.length}</p>
                        </div>
                        <div>Lessons completed</div>
                    </div>
                    <div className="border border-black rouded-lg p-3 gap-2 flex flex-col h-fit">
                        <div className="flex gap-2 items-center">
                            <Image src="/icons/cap.svg" alt="cap" width={22} height={22} />
                            <p className="text-2xl font-bold">{companions.length}</p>
                        </div>
                        <div>Companions created</div>
                    </div>
                </div>
            </section>

            <Accordion type="multiple">
                <AccordionItem value="bookmarks">
                    <AccordionTrigger className="text-2xl font-bold">
                        Bookmarked Companions {`(${bookmarkedCompanions.length})`}
                    </AccordionTrigger>
                    <AccordionContent>
                        <CompanionsList
                            companions={bookmarkedCompanions}
                            title="Bookmarked Companions"
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="recent">
                    <AccordionTrigger className="text-2xl font-bold">
                        Recent Sessions
                    </AccordionTrigger>
                    <AccordionContent>
                        <CompanionsList
                            title="Recent Sessions"
                            companions={sessionHistory}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="companions">
                    <AccordionTrigger className="text-2xl font-bold">
                        My Companions {`(${companions.length})`}
                    </AccordionTrigger>
                    <AccordionContent>
                        <CompanionsList title="My Companions" companions={companions} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Notes section */}
            <section className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">My Notes</h2>
                    <NoteIconButton onClick={() => setIsCreateOpen(true)}></NoteIconButton>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 min-h-[300px]">
                <NotesList
                    notes={notes}
                    onOpenNote = {setSelectedNote}
                    onDeleteNote={handleDeleteNote}
                    onBookmarkNote={handleBookmarkNote}
                />
                </div>
            </section>

            {/*Note modal*/}
            <NoteModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSave={handleCreateNote}
            />

            <NoteViewModal
                note={selectedNote}
                isClick={!!selectedNote} //double negation , convert any value into bool.
                onClose={() => setSelectedNote(null)}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
            />
        </main>
    );
}