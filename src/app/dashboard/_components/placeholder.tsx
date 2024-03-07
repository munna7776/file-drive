import Image from "next/image";
import { UploadFileButton } from "./upload-file-button";

export const FallbackPlaceholder = ({
  query,
  isFavorite = false,
  isTrash = false,
}: {
  query: string;
  isFavorite?: boolean;
  isTrash?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-8 mt-12 items-center">
      <Image src="/empty2.svg" height="300" width="300" alt="No files found" />
      <div className="text-3xl text-gray-700">
        {query
          ? `No files found related to ${query}`
          : isFavorite
          ? "Add some file to favorites list"
          : isTrash
          ? "No files to be deleted"
          : "You have no files, upload a file"}
      </div>
      {!query && !isFavorite && !isTrash && <UploadFileButton />}
    </div>
  );
};
