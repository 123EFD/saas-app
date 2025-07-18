import { PricingTable } from '@clerk/nextjs'
import React from 'react'

const Subscription
 = () => {
  return (
    <div>
      <PricingTable
        appearance={{
          variables: {
            colorPrimary: '#65D7E6',
            colorBackground: '#f9fafb',
            colorText: '#111827',
          },
        }}
        />
    </div>
  )
}

export default Subscription
