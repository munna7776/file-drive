import {
  OrganizationSwitcher,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b bg-gray-50 py-4 relative z-10">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex gap-2 items-center">
          <Image src="/logo.png" alt="file drive logo" height={40} width={40} />
          <span>File Drive</span>
        </Link>
        <SignedIn>
          <Link
            href="/dashboard/files"
            className="rounded-md text-sm font-medium px-4 py-2 border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background hover:bg-accent hover:text-accent-foreground"
          >
            Your Files
          </Link>
        </SignedIn>
        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
          <SignedOut>
            <SignInButton>
              <Button>Sign in</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
