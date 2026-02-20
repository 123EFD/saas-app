// type User = {
//   name: string;
//   email: string;
//   image?: string;
//   accountId: string;
// };


//Updated with Note types
//Data model for Xano Databse Table
export interface Note {
  id:number;
  user_id: string;
  title:string;
  content:string;
  subject: string;
  companion_id?: string;
  bookmarked: boolean;
  created_at: string;
  updated_at: string;
}

//input model for creating note
export interface CreateNoteParams {
  title:string;
  content:string;
  subject:string;
  companion_id?:string;
}

export interface GetNotesParams{
  subject?:string;
  search?:string;
  bookmarked?:boolean;
  page?:number;
  limit?:number;
}

enum Subject {
  maths = "maths",
  language = "language",
  science = "science",
  history = "history",
  coding = "coding",
  geography = "geography",
  economics = "economics",
  finance = "finance",
  business = "business",
}

type Companion = Models.DocumentList<Models.Document> & {
  $id: string;
  name: string;
  subject: Subject;
  topic: string;
  duration: number;
  bookmarked: boolean;
};

interface CreateCompanion {
  name: string;
  subject: string;
  topic: string;
  voice: string;
  style: string;
  duration: number;
  attachmentUrl?: string;
}

interface GetAllCompanions {
  limit?: number;
  page?: number;
  subject?: string | string[];
  topic?: string | string[];
}

interface BuildClient {
  key?: string;
  sessionToken?: string;
}

interface CreateUser {
  email: string;
  name: string;
  image?: string;
  accountId: string;
}

interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface Avatar {
  userName: string;
  width: number;
  height: number;
  className?: string;
}


interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface CompanionComponentProps {
  companionId: string;
  subject: string;
  topic: string;
  name: string;
  userName: string;
  userImage: string;
  voice: string;
  style: string;
}

interface Bookmark {
  id: string;
  userId: string;  // References your User table
  companionId: string;  // References your Companion table
  createdAt: string;
}