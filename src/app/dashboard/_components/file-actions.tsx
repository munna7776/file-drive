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
import { Doc } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "../../../../convex/_generated/api";
import {
  Download,
  MoreHorizontal,
  MoreVertical,
  StarIcon,
  TrashIcon,
  UndoIcon,
} from "lucide-react";
import clsx from "clsx";
import { Protect } from "@clerk/nextjs";
import { getFileURL } from "./file-card";

export const FileCardActions = ({
  file,
  showHorizontalTriggerIcon = false,
}: {
  file: Doc<"files"> & { isFavorite: boolean };
  showHorizontalTriggerIcon?: boolean;
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
          {showHorizontalTriggerIcon ? <MoreHorizontal /> : <MoreVertical />}
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
                "fill-primary": file.isFavorite,
              })}
            />
            {file.isFavorite ? "Remove from favorites" : "Add to favorites"}
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
