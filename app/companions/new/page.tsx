export const dynamic = 'force-dynamic';

import CompanionForm from '@/components/CompanionForm'
import React from 'react'
import { getServerUserId } from '@/lib/server/auth'
import { redirect } from 'next/navigation';

const NewCompanion = async() => {
  const userId = getServerUserId();
  if(!userId) redirect('/sign-in');


  return (
    <main className='min-lg:w-1/3 min-md:2/3 items-center justify-center'>
      
        <article className='w-full gap-4 flex flex-col'>
        <h1>Companion Builder</h1>

        <CompanionForm/>
      </article>

    </main>
  )
}

export default NewCompanion