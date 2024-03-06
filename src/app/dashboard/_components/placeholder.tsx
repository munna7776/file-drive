import Image from "next/image";
import { UploadFileButton } from "./upload-file-button";

export const FallbackPlaceholder = ({ query }: { query: string }) => {
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