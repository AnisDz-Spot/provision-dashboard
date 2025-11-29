"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

