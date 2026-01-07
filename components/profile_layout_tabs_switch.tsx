"use client";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { User, Ticket, Building2 } from "lucide-react";
import { useEffect, useRef } from "react";

const ProfileTabs = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const navRef = useRef<HTMLDivElement>(null);

  // Fix for Safari's dynamic viewport
  useEffect(() => {
    const updatePosition = () => {
      if (navRef.current && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
        const vh = window.visualViewport?.height || window.innerHeight;
        navRef.current.style.bottom = `${window.innerHeight - vh}px`;
      }
    };

    updatePosition();

    window.visualViewport?.addEventListener('resize', updatePosition);
    window.visualViewport?.addEventListener('scroll', updatePosition);

    return () => {
      window.visualViewport?.removeEventListener('resize', updatePosition);
      window.visualViewport?.removeEventListener('scroll', updatePosition);
    };
  }, []);

  // Hide tabs if in administrador section
  const isAdministrador = pathname.includes("/administrador");

  // Determine current tab from pathname
  const getCurrentTab = () => {
    if (pathname.includes("/entradas")) return "entradas";
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
    { value: "entradas", icon: Ticket, label: "Entradas" },
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
                  ? "bg-gray-200 text-gray-900 border border-gray-300 dark:bg-[#2a2a2a] dark:text-white dark:border-[#3a3a3a]"
                  : "bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 dark:bg-[#1a1a1a] dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-[#2a2a2a] dark:border-[#2a2a2a]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mobile: Fixed bottom navigation */}
      <div
        ref={navRef}
        data-profile-menu-bar
        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-background/95 backdrop-blur-md border-t border-gray-200 dark:border-[#303030] z-50 grid grid-cols-3 pb-3 pt-3 transition-all duration-100"
        style={{
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))'
        }}
      >
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
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default ProfileTabs;
