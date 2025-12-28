'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const navItems = [
    {label: 'Home', href: "/"},
    {label: 'Companions', href: "/companions"},
    {label: 'My journey', href: "/my-journey"},
    {label: 'My Notes', href: "/notes"},
]

const NavItems = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [loadingHref, setLoadingHref] = useState<string | null>(null);

    //sync loading state to actual route change
    useEffect(() => {
        if (loadingHref && pathname === loadingHref) {
            setLoadingHref(null);
        }
    }, [pathname, loadingHref]);

    const handleClick = (href: string) => {
        if (pathname !== href) {
            setLoadingHref(href);
        };
    };

    return (
        <nav className="flex items-center gap-4">
            {navItems.map(({label, href}) =>(
                <Link
                    href={href}
                    key={href}
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