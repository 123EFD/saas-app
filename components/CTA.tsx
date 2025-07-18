import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const CTA = () => {
    return (
        <section className='cta-section'>
            <div className='cta-badge'>Start learning your way</div>
            <h2 className='text-3xl font-bold'>
                Build and Personalize your learning journey
            </h2>
            <p className='text-muted-foreground'>
                Create a personalized learning path with our AI companions. 
                Choose your subjects, set your pace, and let us guide you through your educational journey.
            </p>
            <Image
                src="/images/cta.svg"
                alt="cta"
                width={362}
                height={232}
                />
            <button className='btn-primary'>
                <Image src="/icons/plus.svg" alt="plus icon"
                    width={16} height={16} />
                <Link href="/companions/new">
                    <p>Build a New Companion</p>
                </Link>
            </button>
        </section>
    );
    }

export default CTA