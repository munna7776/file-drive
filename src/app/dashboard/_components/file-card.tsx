import { Doc, Id } from "../../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { FileSpreadsheet, FileText, ImageIcon } from "lucide-react";
import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import { formatRelative } from "date-fns";
import { FileCardActions } from "./file-actions";

const FILE_TYPE_ICON = {
  image: <ImageIcon />,
  pdf: <FileText />,
  csv: <FileSpreadsheet />,
} as Record<Doc<"files">["type"], ReactNode>;

export const getFileURL = (id: Id<"_storage">) => {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${id}`;
};

export function FileCard({
  file,
}: {
  file: Doc<"files"> & { isFavorite: boolean };
}) {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });
  const fileURL = getFileURL(file.fileId);

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 items-center text-base font-normal">
          {FILE_TYPE_ICON[file.type]}
          {file.name}
        </CardTitle>
        <div className="absolute top-4 right-1">
          <FileCardActions file={file} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === "image" && (
          <Image
            alt={file.name}
            src={fileURL}
            width="200"
            height="100"
            className="h-full"
          />
        )}
        {file.type === "csv" && <FileSpreadsheet className="size-20" />}
        {file.type === "pdf" && <FileText className="size-20" />}
      </CardContent>
      <CardFooter className="flex-col gap-y-6 items-start">
        <div className="flex gap-2 items-center text-sm text-gray-700">
          <Avatar>
            <AvatarImage src={userProfile?.image} alt={userProfile?.name} />
            <AvatarFallback />
          </Avatar>
          {userProfile?.name}
        </div>
        <div className="text-sm text-gray-700 ml-auto">
          Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
        </div>
      </CardFooter>
    </Card>
  );
}
