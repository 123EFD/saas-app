import Link from 'next/link';
import Image from 'next/image';
import NavItems from './NavItems';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  return (
    <nav className="navbar">
        <Link  href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
                <Image
                    src="/images/book.svg"
                    alt="logo"
                    width={46}
                    height={44}
                />
            </div>
        </Link>
        <div className="flex items-center gap-8">
            <NavItems/>
            <ThemeToggle />
            <SignedOut>
                <div className='flex items-center gap-2'>
                    <SignInButton>
                        <button className='btn-signin bg-amber-400'>Sign in</button>
                    </SignInButton>
                </div>
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </div>
    </nav>
  );
}

export default Navbar