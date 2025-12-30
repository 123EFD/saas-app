
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getUserCompanions,
  getUserSessions,
  getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import { getNotes } from "@/lib/actions/note.actions"; 
import ProfileView from "@/components/profileView"; 

const Profile = async () => {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  //parallel data fetching(run multiple async operations) for readability and performance
  const [
    companions,
    sessionHistory,
    bookmarkedCompanions,
    initialNotes
  ] = await Promise.all([
    getUserCompanions(user.id),
    getUserSessions(user.id),
    getBookmarkedCompanions(user.id),
    getNotes() //Fetch notes from Xano
  ]);


  return (
    <ProfileView 
      user={JSON.parse(JSON.stringify(user))} // Serialize Clerk object
      companions={companions}
      sessionHistory={sessionHistory}
      bookmarkedCompanions={bookmarkedCompanions}
      initialNotes={initialNotes}
    />
  );
};
export default Profile;