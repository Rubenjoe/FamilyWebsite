import { redirect } from "next/navigation";
import { getAdminSession } from "@/utils/admin";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard?error=unauthorized");
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
