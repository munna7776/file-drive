"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { UploadFileButton } from "./upload-file-button";
import { FileCard } from "./file-card";

export default function Home() {
  const { organization, isLoaded: isOrgainzationLoaded } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();

  let orgOrUserId: string | undefined = undefined;
  if (isUserLoaded && isOrgainzationLoaded) {
    orgOrUserId = organization?.id ?? user?.id;
  }

  const files = useQuery(
    api.files.getFiles,
    orgOrUserId ? { orgId: orgOrUserId } : "skip",
  );

  return (
    <main className="container p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Files</h1>
        <UploadFileButton />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {files?.map((file) => (
          <FileCard key={file._id} file={file} />
        ))}
      </div>
    </main>
  );
}
