"use client";

import { Button } from "@/components/ui/button";
import { SignOutButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { SignInButton, useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const { organization, isLoaded: isOrgainzationLoaded } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();

  let orgOrUserId: string | undefined = undefined;
  let orgOrUserName: string | undefined | null = undefined;
  if (isUserLoaded && isOrgainzationLoaded) {
    orgOrUserId = organization?.id ?? user?.id;
    orgOrUserName = organization?.name ?? user?.fullName;
  }

  const createFile = useMutation(api.files.createFile);
  const files = useQuery(
    api.files.getFiles,
    orgOrUserId ? { orgId: orgOrUserId } : "skip",
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignedIn>
        <SignOutButton>
          <Button>Sign out</Button>
        </SignOutButton>
      </SignedIn>
      {files?.map((file) => (
        <div key={file._id}>{file.name}</div>
      ))}
      <Button
        onClick={() => {
          if (!orgOrUserId) {
            return;
          }
          createFile({
            name: `Hello Munna, welcome to file drive project by ${orgOrUserName}`,
            orgId: orgOrUserId,
          });
        }}
      >
        Click me
      </Button>
    </main>
  );
}
