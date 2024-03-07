"use client";

import { Loader2 } from "lucide-react";
import { SearchBar } from "./search-bar";
import { UploadFileButton } from "./upload-file-button";
import { FallbackPlaceholder } from "./placeholder";
import { FileCard } from "./file-card";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";

export const FileBrowser = ({
  title,
  isFavorite,
  markAsDelete,
}: {
  title: string;
  isFavorite?: boolean;
  markAsDelete?: boolean;
}) => {
  const { organization, isLoaded: isOrgainzationLoaded } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();
  const [query, setQuery] = useState("");

  let orgOrUserId: string | undefined = undefined;
  if (isUserLoaded && isOrgainzationLoaded) {
    orgOrUserId = organization?.id ?? user?.id;
  }

  const favorites = useQuery(
    api.files.getAllFavorites,
    orgOrUserId ? { orgId: orgOrUserId } : "skip",
  );

  const files = useQuery(
    api.files.getFiles,
    orgOrUserId
      ? { orgId: orgOrUserId, query, isFavorite, markAsDelete }
      : "skip",
  );

  const isLoading = files === undefined;
  return (
    <div>
      {isLoading && (
        <div className="flex flex-col gap-4 mt-12 items-center">
          <Loader2 className="size-20 animate-spin text-gray-600" />
          <div className="text-xl text-gray-700">Loading your files...</div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{title}</h1>
            <SearchBar query={query} setQuery={setQuery} />
            <UploadFileButton />
          </div>
          {files.length === 0 ? (
            <FallbackPlaceholder
              query={query}
              isFavorite={isFavorite}
              isTrash={markAsDelete}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {files?.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  favorites={favorites ?? []}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
