import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConfiguracionTabs } from "@/components/configuracion-tabs";
import { AdminHeader } from "@/components/admin-header";

interface ConfiguracionPageProps {
  params: Promise<{
    userId: string;
  }>;
}

const ConfiguracionPage = async ({ params }: ConfiguracionPageProps) => {
  const { userId } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("admin")
    .eq("id", user.id)
    .single();

  if (!profile?.admin) {
    notFound();
  }

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-4">
      {/* Page Header */}
      <AdminHeader
        title="CONFIGURACIÓN"
        subtitle="Administra la configuración del sistema"
      />

      {/* Configuration Tabs */}
      <ConfiguracionTabs />
    </div>
  );
};

export default ConfiguracionPage;