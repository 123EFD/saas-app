"use server";
/*

backend calls CRUD
createNote(userId, companionId, data)   
getNotes(userId, filters)                
getNote(noteId)                          
updateNote(noteId, data)                 
deleteNote(noteId)                       
toggleBookmark(noteId)  

*/

import { createXanoClient } from "@/lib/xano";
import { revalidatePath } from "next/cache";
import { Note, CreateNoteParams, GetNotesParams } from "@/types";
import { tr } from "zod/v4/locales";
import { coerce } from "zod";

//sanity check preview for logging arbitrary payloads
function safePreview(value: any, len = 800) : string {
  try {
    return JSON.stringify(value).slice(0, len);
  } catch (error) {
    return String(value);
  }
}

//Coerce single-note responses in createNote, getNote, updateNote, toggleBookmark.
function coerceNote(n: any) : Note {
  return {
    id:Number(n?.id),
    title: String(n?.title ?? ""),
    content: String(n?.content ?? ""),
    subject: String(n?.subject ?? "General"),
    bookmarked: Boolean(n?.bookmarked ?? false),
    created_at:
      typeof n?.created_at === "number"
        ? n.created_at
        : Number(n?.created_at ?? Date.now()),

    companion_id:
      n?.companion_id !== undefined && n?.companion_id !== null
        ? String(n?.companion_id)
        : undefined,
  } as Note;
}

//normalize the list response in getNotes to always return Note[]
function normalizeNotesList(payload: any): Note[] {
  if (Array.isArray(payload)) return payload.map(coerceNote);
  if (Array.isArray(payload?.items)) return payload.items.map(coerceNote);
  if (Array.isArray(payload?.data)) return payload.data.map(coerceNote);
  if (Array.isArray(payload?.records)) return payload.records.map(coerceNote);
  if (Array.isArray(payload?.results)) return payload.results.map(coerceNote);
  if (Array.isArray(payload?.notes)) return payload.notes.map(coerceNote);
  return [];
}

// 1. CREATE Note
export const createNote = async (data: {
  title: string;
  content: string;
  subject: string;
  companion_id?: string;
}) => {
  const { request, userId } = await createXanoClient();

  // We inject userId here securely
  const raw = await request<Note>("/create_study_note",{
    method: "POST",
    body: JSON.stringify({
        user_id: userId, 
        ...data,
    }),
    
  });

  //sanity check: visible in server console
  console.debug("[createNote] raw:", safePreview(raw))

  const newNote = coerceNote(raw);
  revalidatePath("/my-journey"); // Refresh UI
  return newNote;
};

// 2. GET All Notes (Query)
export const getNotes = async (filters?: {
  subject?: string;
  search?: string;
  bookmarked?: boolean;
}) => {
  const { request, userId } = await createXanoClient();

  // Construct Query Params
  const params = new URLSearchParams();
  params.append("user_id", userId); // Mandatory security param

  if (filters?.subject) params.append("subject", filters.subject);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.bookmarked !== undefined) params.append("bookmarked", String(filters.bookmarked));

  const raw = await request<Note[]>(`/get_study_notes?${params.toString()}`, {
    method: "GET",
  });

  console.debug("[getNotes] raw:", safePreview(raw));
  const notes = normalizeNotesList(raw);
  if(!Array.isArray(raw)) {
    console.warn(
      "[getNotes] non-array payload detected; normalized to",
      notes.length,
      "items"
    );
  }
  return notes;
};

// 3. GET Single Note
export const getNote = async (id: number) => {
  const { request, userId } = await createXanoClient();
  
  // Pass userId in query for the ownership check in Xano
  const raw = await request<Note>(`/study_note/${id}?user_id=${userId}`, {
    method: "GET",
  });
  console.debug("[getNote] raw:", safePreview(raw));
  return coerceNote(raw);
};

// 4. UPDATE Note
export const updateNote = async (id: number, data: {
  title?: string;
  content?: string;
  subject?: string;
}) => {
  const { request, userId } = await createXanoClient();

  // Pass userId in body for ownership check
  const raw = await request<Note>(`/study_note/${id}`, {
    method: "PUT",
    body: JSON.stringify({
        user_id: userId,
        ...data,
    }),
  });

  console.debug("[updateNote] raw:", safePreview(raw));
  const updated = coerceNote(raw);

  revalidatePath("/my-journey");
  return updated;
};

// 5. DELETE Note
export const deleteNote = async (id: number) => {
  const { request, userId } = await createXanoClient();

  // Pass userId in query for ownership check
  await request(`/study_note/${id}?user_id=${userId}`,{
    method: "DELETE",
  });

  revalidatePath("/my-journey");
  return { success: true };
};

// 6. TOGGLE Bookmark
export const toggleBookmark = async (id: number) => {
  const { request, userId } = await createXanoClient();

  // Pass userId for ownership check
  const raw = await request<Note>(`/study_note/${id}/bookmark`, {
    method:"PATCH",
    body: JSON.stringify({
        user_id: userId,
    }),
    
  });

  console.debug("[toggleBookmark] raw:", safePreview(raw));
  const updated = coerceNote(raw);

  revalidatePath("/my-journey");
  return updated;
};