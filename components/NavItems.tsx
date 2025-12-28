'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Label } from '@radix-ui/react-select';

const navItems = [
    {label: 'Home', href: "/"},
    {label: 'Companions', href: "/companions"},
    {label: 'My journey', href: "/my-journey"},
    {Label: 'My Notes', href: "/notes"},
]

const NavItems = () => {
    const pathname = usePathname();
    const [loadingHref, setLoadingHref] = useState<string | null>(null);

    const handleClick = (href: string) => {
        setLoadingHref(href);
        // Reset loading state after 2 seconds (simulating navigation)
        setTimeout(() => setLoadingHref(null), 2000);
    };

    return (
        <nav className="flex items-center gap-4">
            {navItems.map(({ label, href}) =>(
                <Link
                    href={href}
                    key={label}
                    className={`${pathname === href ? 'text-primary font-semibold' : 'text-muted-foreground'} flex items-center gap-2`}
                    onClick={() => handleClick(href)}
                >
                    {label}
                    {loadingHref === href && <Loader2 className="h-4 w-4 animate-spin" />}
                </Link>
            ))}
        </nav>
    )
}

export default NavItems