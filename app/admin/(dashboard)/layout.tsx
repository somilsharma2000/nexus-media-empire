import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Cryptographic server-side NextAuth verification:
  // If no session exists or user is not authenticated, redirect to /admin/login immediately
  if (!session?.user) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
