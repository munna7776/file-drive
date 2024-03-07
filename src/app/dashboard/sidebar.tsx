"use client";

import clsx from "clsx";
import { FileIcon, Star, TrashIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export const Sidebar = () => {
  return (
    <aside className="w-40 flex flex-col gap-6">
      <NavLink href="/dashboard/files">
        <FileIcon />
        All Files
      </NavLink>
      <NavLink href="/dashboard/favorites">
        <Star />
        Favorites
      </NavLink>
      <NavLink href="/dashboard/trash">
        <TrashIcon />
        Trash
      </NavLink>
    </aside>
  );
};

const NavLink = ({ href, children }: { href: string; children: ReactNode }) => {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={clsx(
        "flex gap-1 items-center justify-start whitespace-nowrap text-sm font-medium text-primary underline-offset-4 hover:underline",
        {
          "text-blue-400": pathname.includes(href),
        },
      )}
    >
      {children}
    </Link>
  );
};
