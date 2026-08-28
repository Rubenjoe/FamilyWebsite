import { getAdminSession } from "@/utils/admin";
import { redirect } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminDuesPage() {
  const session = await getAdminSession();
  if (!session || !session.canViewDues) {
    redirect("/dashboard?error=unauthorized");
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dues & Finances"
        subtitle="Treasurer view — placeholder for future dues tracking."
      />
      <div className="bg-white border border-dashed border-gray-200 p-12 text-center">
        <p className="text-sm text-gray-400 font-light italic">
          Dues management module coming soon. This view is currently restricted to treasurers and administrators.
        </p>
      </div>
    </div>
  );
}
