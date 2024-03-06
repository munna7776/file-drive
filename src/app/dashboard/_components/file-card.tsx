import { Button } from "@/components/ui/button";
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

import {
  FileSpreadsheet,
  FileText,
  ImageIcon,
  MoreVertical,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import clsx from "clsx";

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
  isFileFavorite = false,
}: {
  file: Doc<"files">;
  isFileFavorite: boolean;
}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
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
              This action cannot be undone. This will delete your file from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({ fileId: file._id });
                toast({
                  variant: "default",
                  title: "Deleted file successfully.",
                  description: "Your file is deleted from the system.",
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsConfirmDialogOpen(true)}
            className="flex gap-1 items-center text-red-600"
          >
            <TrashIcon className="size-4" />
            Delete
          </DropdownMenuItem>
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
  const isFavorite = favorites.some((f) => f.fileId === file._id);
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 items-center">
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
            src={getFileURL(file.fileId)}
            width="200"
            height="100"
          />
        )}
        {file.type === "csv" && <FileSpreadsheet className="size-20" />}
        {file.type === "pdf" && <FileText className="size-20" />}
      </CardContent>
      <CardFooter className="justify-center">
        <Button
          onClick={() => {
            window.open(getFileURL(file.fileId));
          }}
        >
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
