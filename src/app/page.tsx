"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { UploadFileButton } from "./upload-file-button";
import { FileCard } from "./file-card";
import { Loader2 } from "lucide-react";
import Image from "next/image";

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

  const isLoading = files === undefined;

  return (
    <main className="container p-12">
      {isLoading && (
        <div className="flex flex-col gap-4 mt-12 items-center">
          <Loader2 className="size-20 animate-spin text-gray-600" />
          <div className="text-xl text-gray-700">Loading your files...</div>
        </div>
      )}
      {!isLoading && files.length === 0 && (
        <div className="flex flex-col gap-8 mt-12 items-center">
          <Image
            src="/empty2.svg"
            height="300"
            width="300"
            alt="No files found"
          />
          <div className="text-3xl text-gray-700">
            You have no files, upload a file
          </div>
          <UploadFileButton />
        </div>
      )}
      {!isLoading && files.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your Files</h1>
            <UploadFileButton />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {files?.map((file) => (
              <FileCard key={file._id} file={file} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
