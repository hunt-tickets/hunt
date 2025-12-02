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
  ];

  return (
    <>
      {/* Desktop: Admin-style tabs */}
      <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#2a2a2a] text-white border border-[#3a3a3a]"
                  : "bg-[#1a1a1a] text-gray-400 hover:text-gray-300 hover:bg-[#2a2a2a] border border-[#2a2a2a]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mobile: Fixed bottom navigation */}
      <div data-profile-menu-bar className="md:hidden fixed bottom-0 left-0 right-0 w-full h-16 bg-background/95 backdrop-blur-md border-t border-[#303030] z-50 grid grid-cols-3">
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
