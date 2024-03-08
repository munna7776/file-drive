"use client";

import { GridIcon, Loader2, Table2Icon } from "lucide-react";
import { SearchBar } from "./search-bar";
import { UploadFileButton } from "./upload-file-button";
import { FallbackPlaceholder } from "./placeholder";
import { FileCard } from "./file-card";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Doc } from "../../../../convex/_generated/dataModel";

type FileType = Doc<"files">["type"] | "all";

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
  const [type, setType] = useState<FileType>("all");

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
      ? {
          orgId: orgOrUserId,
          query,
          isFavorite,
          markAsDelete,
          type: type === "all" ? undefined : type,
        }
      : "skip",
  );

  const isLoading = files === undefined;

  const modifiedFiles =
    files?.map((file) => ({
      ...file,
      isFavorite: (favorites ?? []).some((f) => f.fileId === file._id),
    })) ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{title}</h1>
        <SearchBar query={query} setQuery={setQuery} />
        <UploadFileButton />
      </div>
      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center">
          <TabsList className="mb-4">
            <TabsTrigger value="grid" className="flex gap-2 items-center">
              <GridIcon /> Grid
            </TabsTrigger>
            <TabsTrigger value="table">
              <Table2Icon /> Table
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2 items-center">
            <Label htmlFor="type-filter">Filter by type</Label>
            <Select
              value={type}
              onValueChange={(newValue: FileType) => setType(newValue)}
            >
              <SelectTrigger id="type-filter" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLoading && (
          <div className="flex flex-col gap-4 mt-12 items-center">
            <Loader2 className="size-20 animate-spin text-gray-600" />
            <div className="text-xl text-gray-700">Loading your files...</div>
          </div>
        )}
        {!isLoading && (
          <>
            <TabsContent value="grid">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {modifiedFiles?.map((file) => (
                  <FileCard key={file._id} file={file} />
                ))}
              </div>
              {files.length === 0 && (
                <FallbackPlaceholder
                  query={query}
                  isFavorite={isFavorite}
                  isTrash={markAsDelete}
                />
              )}
            </TabsContent>
            <TabsContent value="table">
              <DataTable
                columns={columns}
                data={modifiedFiles}
                renderNoResult={
                  <div className="text-3xl text-gray-700 my-14">
                    {query
                      ? `No files found related to ${query}`
                      : isFavorite
                      ? "Add some file to favorites list"
                      : markAsDelete
                      ? "No files to be deleted"
                      : "You have no files, upload a file"}
                  </div>
                }
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};
