"use client";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { User, Ticket, HelpCircle, Building2 } from "lucide-react";

const ProfileTabs = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Hide tabs if in administrador section
  const isAdministrador = pathname.includes("/administrador");

  // Determine current tab from pathname
  const getCurrentTab = () => {
    if (pathname.includes("/tickets")) return "tickets";
    if (pathname.includes("/organizaciones")) return "organizaciones";
    if (pathname.includes("/soporte")) return "soporte";

    return "general";
  };

  const currentTab = getCurrentTab();

  const handleTabChange = (value: string) => {
    if (!session?.user?.id) return;

    if (value === "general") {
      router.push("/profile");
    } else {
      router.push(`/profile/${session.user.id}/${value}`);
    }
  };

  if (!session?.user || isAdministrador) {
    return null;
  }

  const tabs = [
    { value: "general", icon: User, label: "General" },
    { value: "tickets", icon: Ticket, label: "Entradas" },
    { value: "organizaciones", icon: Building2, label: "Organizaciones" },
    { value: "soporte", icon: HelpCircle, label: "Soporte" },
  ];

  return (
    <>
      {/* Desktop: Entradas-style tabs */}
      <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 hover:bg-white/10 text-white/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mobile: Fixed bottom navigation */}
      <div data-profile-menu-bar className="md:hidden fixed bottom-0 left-0 right-0 w-full h-16 bg-background/95 backdrop-blur-md border-t border-[#303030] z-50 grid grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`
                flex flex-col items-center justify-center gap-1
                transition-all duration-300
                ${
                  isActive
                    ? 'text-primary'
                    : 'text-foreground/70'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default ProfileTabs;
