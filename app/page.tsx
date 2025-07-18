import CompanionCard from '@/components/CompanionCard'
import CompanionsList from '@/components/CompanionsList'
import CTA from '@/components/CTA'
import { recentSessions } from '@/constants'
import React from 'react'

const Page = () => {
  return (
    <main>
      <h1>Popular Companions</h1>
      
          <section className='home-section'>
            <CompanionCard
                id="123"
                name="Neura the Brainy Explorer"
                topic="Neural Networks of the Brian"
                subject="Neuroscience"
                duration={45}
                color="#62e6f3"
                />

            <CompanionCard
                id="456"
                name="Countsy the Number Wizard"
                topic="Derivatives & Integration"
                subject="Mathematics"
                duration={30}
                color="#fea0c9"
            />

            <CompanionCard
                id="789"
                name="Verba the Language Sage"
                topic="Language"
                subject="English Literature"
                duration={45}
                color="#e8c1f3"
            />
          </section>

          <section className='home-section'>
            <CompanionsList
              title="Recent completed sessions"
              companions={recentSessions}
              className="w-2/3 max-lg:w-full"
            />
            <CTA/>
          </section>
      
    </main>
  )
}

export default Page