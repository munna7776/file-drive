import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex p-12 gap-8">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
