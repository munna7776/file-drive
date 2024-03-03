"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { UploadFileButton } from "./upload-file-button";
import { FileCard } from "./file-card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SearchBar } from "./search-bar";

export default function Home() {
  const { organization, isLoaded: isOrgainzationLoaded } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();
  const [query, setQuery] = useState("");

  let orgOrUserId: string | undefined = undefined;
  if (isUserLoaded && isOrgainzationLoaded) {
    orgOrUserId = organization?.id ?? user?.id;
  }

  const files = useQuery(
    api.files.getFiles,
    orgOrUserId ? { orgId: orgOrUserId, query } : "skip",
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
      {!isLoading && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your Files</h1>
            <SearchBar query={query} setQuery={setQuery} />
            <UploadFileButton />
          </div>
          {files.length === 0 ? (
            <Placeholder query={query} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {files?.map((file) => (
                <FileCard key={file._id} file={file} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

const Placeholder = ({ query }: { query: string }) => {
  return (
    <div className="flex flex-col gap-8 mt-12 items-center">
      <Image src="/empty2.svg" height="300" width="300" alt="No files found" />
      <div className="text-3xl text-gray-700">
        {query
          ? `No files found related to ${query}`
          : "You have no files, upload a file"}
      </div>
      {!query && <UploadFileButton />}
    </div>
  );
};
