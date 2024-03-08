import { Doc, Id } from "../../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Download,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  MoreVertical,
  StarIcon,
  TrashIcon,
  UndoIcon,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import clsx from "clsx";
import { Protect } from "@clerk/nextjs";
import { format, formatDistance, formatRelative, subDays } from "date-fns";

const FILE_TYPE_ICON = {
  image: <ImageIcon />,
  pdf: <FileText />,
  csv: <FileSpreadsheet />,
} as Record<Doc<"files">["type"], ReactNode>;

const getFileURL = (id: Id<"_storage">) => {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${id}`;
};

const FileCardActions = ({
  file,
  isFileFavorite,
}: {
  file: Doc<"files">;
  isFileFavorite: boolean;
}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const { toast } = useToast();
  return (
    <>
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the file for deletion process. Files will be
              deleted periodically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({ fileId: file._id });
                toast({
                  variant: "default",
                  title: "File is moved to trash.",
                  description: "Your file will be deleted soon.",
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              window.open(getFileURL(file.fileId));
            }}
            className="flex gap-1 items-center"
          >
            <Download className="size-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await toggleFavorite({ fileId: file._id });
            }}
            className="flex gap-1 items-center"
          >
            <StarIcon
              className={clsx("size-4", {
                "fill-primary": isFileFavorite,
              })}
            />
            {isFileFavorite ? "Remove from favorites" : "Add to favorites"}
          </DropdownMenuItem>
          <Protect role="org:admin" fallback={<></>}>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                if (file.shouldDelete) {
                  await restoreFile({ fileId: file._id });
                } else {
                  setIsConfirmDialogOpen(true);
                }
              }}
              className={clsx("flex gap-1 items-center text-red-600", {
                "text-green-600": file.shouldDelete,
              })}
            >
              {file.shouldDelete ? (
                <>
                  <UndoIcon className="size-4" />
                  Restore
                </>
              ) : (
                <>
                  <TrashIcon className="size-4" />
                  Delete
                </>
              )}
            </DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export function FileCard({
  file,
  favorites,
}: {
  file: Doc<"files">;
  favorites: Doc<"favorites">[];
}) {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });
  const isFavorite = favorites.some((f) => f.fileId === file._id);
  const fileURL = getFileURL(file.fileId);

  console.log(userProfile);

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 items-center text-base font-normal">
          {FILE_TYPE_ICON[file.type]}
          {file.name}
        </CardTitle>
        <div className="absolute top-4 right-1">
          <FileCardActions file={file} isFileFavorite={isFavorite} />
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
