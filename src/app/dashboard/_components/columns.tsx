import { ColumnDef } from "@tanstack/react-table";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatRelative } from "date-fns";
import { FileCardActions } from "./file-actions";

const UserProfile = ({ userId }: { userId: Id<"users"> }) => {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: userId,
  });
  return (
    <div className="flex gap-2 items-center text-sm text-gray-700">
      <Avatar>
        <AvatarImage src={userProfile?.image} alt={userProfile?.name} />
        <AvatarFallback />
      </Avatar>
      {userProfile?.name}
    </div>
  );
};

export const columns: ColumnDef<Doc<"files"> & { isFavorite: boolean }>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    header: "User",
    cell: ({ row }) => {
      return <UserProfile userId={row.original.userId} />;
    },
  },
  {
    accessorKey: "_creationTime",
    header: "Uploaded on",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-gray-700 ml-auto">
          {formatRelative(new Date(row.original._creationTime), new Date())}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <FileCardActions file={row.original} showHorizontalTriggerIcon />
    ),
  },
];
