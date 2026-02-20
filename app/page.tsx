import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import {getAllCompanions, getRecentSessions} from "@/lib/actions/companion.actions";
import {getSubjectColor} from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";

const Page = async () => {
  const companions = await getAllCompanions({ limit:3 });
  const user = await currentUser();

  const recentSessionCompanions = user ? await getRecentSessions(10, user.id) : [];

  return (
    <main>
      <h1>Popular Companions</h1>
      
          <section className='home-section'>
            {companions.map((companion) => (
                <CompanionCard
                    key={companion.id}
                    {...companion}
                    color={getSubjectColor(companion.subject)}
                />
            ))}
            
          </section>

          <section className='home-section'>
            <CompanionsList
              title="Recently completed sessions"
              companions={recentSessionCompanions}
              classNames="w-2/3 max-lg:w-full"
            />
            <CTA/>
          </section>
    </main>
  )
}

export default Page