import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminDashboardContent } from "@/components/admin-dashboard-content";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dashboard",
  };
}

interface DashboardPageProps {
  params: Promise<{
    userId: string;
  }>;
}

const DashboardPage = async ({ params }: DashboardPageProps) => {
  const { userId } = await params;

  // Auth check using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  // Mock organization data - In production, get the selected organization from Better Auth
  const organization = {
    id: "org-1",
    name: "Mi Organización",
    slug: "mi-organizacion",
    logo: null,
  };

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6">
      <AdminDashboardContent organization={organization} />
    </div>
  );
};

export default DashboardPage;
