
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

  try {
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
        user={{
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddresses: user.emailAddresses.map(e => ({ emailAddress: e.emailAddress }))
        }}
        companions={companions}
        sessionHistory={sessionHistory}
        bookmarkedCompanions={bookmarkedCompanions}
        initialNotes={initialNotes}
      />
    );
  } catch (error) {
    console.error("[Profile Page] Error loading data:", error);
    // Return with empty/fallback data or specific error UI
    // For now, return ProfileView with empty data to avoid crash
    return (
      <ProfileView
        user={{
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddresses: user.emailAddresses.map(e => ({ emailAddress: e.emailAddress }))
        }}
        companions={[]}
        sessionHistory={[]}
        bookmarkedCompanions={[]}
        initialNotes={[]}
      />
    );
  }
};
export default Profile;