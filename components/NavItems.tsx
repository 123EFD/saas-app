'use client';
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    {label: 'Home', href: "/"},
    {label: 'Companions', href: "/companions"},
    {label: 'My journey', href: "/my-journey"},
]
const NavItems = () => {
    const pathname = usePathname();
    return (
        
    <nav className="flex items-center gap-4">
        {navItems.map(({ label, href}) =>(
            <Link
                href={href}
                key={label}
className={`${pathname === href ? 'text-primary font-semibold' : ''}`}
                >
                {label}
            </Link>
        ))}
    </nav>
  )
}

export default NavItems