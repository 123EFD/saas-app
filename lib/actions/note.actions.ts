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

// --- Types based on your Xano Schema ---
export interface Note {
  id: number;
  user_id: string;
  title: string;
  content: string;
  subject: string;
  bookmarked: boolean;
  created_at: number;
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
  const newNote = await request<Note>("/study_note",{
    method: "POST",
    body: JSON.stringify({
        user_id: userId, 
        ...data,
    }),
    
  });

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

  const notes = await request<Note[]>(`/study_note?${params.toString()}`, {
    method: "GET",
  });
  return notes;
};

// 3. GET Single Note
export const getNote = async (id: number) => {
  const { request, userId } = await createXanoClient();
  
  // Pass userId in query for the ownership check in Xano
  const note = await request<Note>(`/study_note/${id}?user_id=${userId}`, {
    method: "GET",
  });
  return note;
};

// 4. UPDATE Note
export const updateNote = async (id: number, data: {
  title?: string;
  content?: string;
  subject?: string;
}) => {
  const { request, userId } = await createXanoClient();

  // Pass userId in body for ownership check
  const updated = await request<Note>(`/study_note/${id}`, {
    method: "PUT",
    body: JSON.stringify({
        user_id: userId,
        ...data
    })
  });

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
  const updated = await request<Note>(`/study_note/${id}/bookmark`, {
    method:"PATCH",
    body: JSON.stringify({
        user_id: userId,
    }),
    
  });

  revalidatePath("/my-journey");
  return updated;
};