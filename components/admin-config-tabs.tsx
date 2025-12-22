"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Settings,
  Mail,
  Shield,
  CreditCard,
  MailCheck,
  Search,
  Phone,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { EditOrganizationForm } from "@/components/edit-organization-form";
import { AdminPaymentSettings } from "@/components/admin-payment-settings";
import type { PaymentProcessorAccount } from "@/lib/schema";

// Organization type that accepts both null and undefined for optional fields
// This is needed because Better Auth returns undefined while Drizzle uses null
interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  metadata?: string | null;
  tipoOrganizacion?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  nit?: string | null;
  direccion?: string | null;
  numeroTelefono?: string | null;
  correoElectronico?: string | null;
  rutUrl?: string | null;
  cerlUrl?: string | null;
  paymentAccounts?: PaymentProcessorAccount[];
}

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  inviterId: string;
}

interface AdminConfigTabsProps {
  organization: OrganizationData | null;
  team: TeamMember[];
  invitations: Invitation[];
  currentUserRole: string;
  mpOauthUrl?: string;
}

type TabType = "general" | "equipo" | "procesadores";

export function AdminConfigTabs({
  organization,
  team,
  invitations,
  currentUserRole,
  mpOauthUrl,
}: AdminConfigTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelingInvitation, setCancelingInvitation] = useState<string | null>(
    null
  );

  const displayTeam = team.length > 0 ? team : [];

  // Cancel invitation
  const handleCancelInvitation = async (invitationId: string) => {
    if (!organization) return;

    setCancelingInvitation(invitationId);
    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });

      if (error) {
        console.error("Error canceling invitation:", error);
        toast.error(error.message || "Error al cancelar la invitación");
        return;
      }

      toast.success("Invitación cancelada exitosamente");
      router.refresh();
    } catch (error) {
      console.error("Error canceling invitation:", error);
      toast.error("Error al cancelar la invitación");
    } finally {
      setCancelingInvitation(null);
    }
  };

  // Combine team members with pending invitations
  const combinedTeamData = [
    ...displayTeam.map((member) => ({ ...member, isPending: false })),
    ...invitations
      .filter((inv) => inv.status === "pending")
      .map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        isPending: true,
        user: null,
      })),
  ];

  // Filter combined data based on search query
  const filteredTeamData = combinedTeamData.filter((member) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const name = member.isPending
      ? "invitación pendiente"
      : (member.user?.name || "").toLowerCase();
    const email = member.isPending
      ? "email" in member
        ? member.email.toLowerCase()
        : ""
      : (member.user?.email || "").toLowerCase();
    const role = formatRole(member.role || "").toLowerCase();

    return (
      name.includes(query) || email.includes(query) || role.includes(query)
    );
  });

  // Check permissions
  const canInvite =
    currentUserRole === "owner" || currentUserRole === "administrator";

  // Format role for display
  const formatRole = (role: string) => {
    const roleMap: { [key: string]: string } = {
      owner: "Propietario",
      administrator: "Administrador",
      seller: "Vendedor",
      member: "Miembro",
    };
    return roleMap[role] || role;
  };

  const tabs = [
    { value: "general", icon: Settings, label: "General" },
    { value: "equipo", icon: Users, label: "Equipo" },
    { value: "procesadores", icon: CreditCard, label: "Procesadores" },
  ] as const;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-gray-100 dark:bg-white/10 text-foreground border border-gray-200 dark:border-white/20"
                      : "text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search and Add Member Button - Only show in Equipo tab */}
          {activeTab === "equipo" && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Buscar miembros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-[280px] pl-9 pr-3 py-2 text-sm rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 focus:outline-none focus:border-gray-300 dark:focus:border-white/20 transition-all"
                />
              </div>

              {/* Add Member Button */}
              {organization && canInvite && (
                <div className="w-full sm:w-auto">
                  <InviteMemberDialog organizationId={organization.id} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "equipo" && (
            <div className="space-y-4">
              {/* Team Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredTeamData.map((member) => {
                  const isPending = member.isPending;
                  const fullName = isPending
                    ? "Invitación Pendiente"
                    : member.user?.name || "Usuario sin nombre";
                  const email = isPending
                    ? "email" in member
                      ? member.email
                      : "Sin correo"
                    : member.user?.email || "Sin correo";
                  const role = member.role || "member";

                  const initials = isPending
                    ? "?"
                    : fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);

                  return (
                    <Card
                      key={member.id}
                      className="bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/10 min-w-0"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold text-sm ring-1 ${
                                isPending
                                  ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 ring-orange-300 dark:ring-orange-700"
                                  : "bg-gray-200 dark:bg-white/[0.08] text-gray-700 dark:text-white/90 ring-gray-300 dark:ring-white/10"
                              }`}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`font-medium truncate ${isPending ? "text-gray-600 dark:text-white/60 italic" : "text-gray-900 dark:text-white"}`}
                              >
                                {fullName}
                              </p>
                              {email !== "Sin correo" && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Mail className="h-3 w-3 text-gray-400 dark:text-white/40 flex-shrink-0" />
                                  <span className="text-xs text-gray-600 dark:text-white/60 truncate">
                                    {email}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {isPending ? (
                              <>
                                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700 text-xs">
                                  <MailCheck className="h-3 w-3 mr-1" />
                                  Pendiente
                                </Badge>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelInvitation(member.id);
                                  }}
                                  disabled={cancelingInvitation === member.id}
                                  className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs text-red-600 dark:text-red-400 font-medium"
                                >
                                  <X className="h-3 w-3" />
                                  Cancelar
                                </button>
                              </>
                            ) : role === "owner" ? (
                              <Badge
                                variant="default"
                                className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-2 border-gray-900 dark:border-gray-100 text-xs font-semibold"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                {formatRole(role)}
                              </Badge>
                            ) : role === "administrator" ? (
                              <Badge
                                variant="outline"
                                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 text-xs"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                {formatRole(role)}
                              </Badge>
                            ) : role === "seller" ? (
                              <Badge
                                variant="outline"
                                className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-xs"
                              >
                                {formatRole(role)}
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 bg-gray-50 dark:bg-white/[0.02] text-xs"
                              >
                                {formatRole(role)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Team Table - Desktop */}
              <div className="hidden md:block rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-white/5">
                        <TableHead className="font-medium text-gray-600 dark:text-white/50 py-3 pl-6 text-xs uppercase tracking-wider">
                          Miembro
                        </TableHead>
                        <TableHead className="font-medium text-gray-600 dark:text-white/50 text-xs uppercase tracking-wider">
                          Contacto
                        </TableHead>
                        <TableHead className="font-medium text-gray-600 dark:text-white/50 text-xs uppercase tracking-wider">
                          Teléfono
                        </TableHead>
                        <TableHead className="font-medium text-gray-600 dark:text-white/50 text-xs uppercase tracking-wider pr-6">
                          Rol
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeamData.map((member) => {
                        const isPending = member.isPending;
                        const fullName = isPending
                          ? "Invitación Pendiente"
                          : member.user?.name || "Usuario sin nombre";
                        const email = isPending
                          ? "email" in member
                            ? member.email
                            : "Sin correo"
                          : member.user?.email || "Sin correo";
                        const phoneNumber = isPending
                          ? null
                          : member.user?.phoneNumber || null;
                        const role = member.role || "member";

                        const initials = isPending
                          ? "?"
                          : fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2);

                        return (
                          <TableRow
                            key={member.id}
                            className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.02] transition-all duration-200"
                          >
                            <TableCell className="py-5 pl-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold text-sm ring-1 ${
                                    isPending
                                      ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 ring-orange-300 dark:ring-orange-700"
                                      : "bg-gray-200 dark:bg-white/[0.08] text-gray-700 dark:text-white/90 ring-gray-300 dark:ring-white/10"
                                  }`}
                                >
                                  {initials}
                                </div>
                                <div className="flex flex-col min-w-0 gap-0.5">
                                  <span
                                    className={`font-medium truncate ${isPending ? "text-gray-600 dark:text-white/60 italic" : "text-gray-900 dark:text-white"}`}
                                  >
                                    {fullName}
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-5">
                              {email !== "Sin correo" ? (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3.5 w-3.5 text-gray-400 dark:text-white/40" />
                                  <span className="text-sm text-gray-600 dark:text-white/70">
                                    {email}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 dark:text-white/30">
                                  Sin correo
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="py-5">
                              {phoneNumber ? (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-white/40" />
                                  <span className="text-sm text-gray-600 dark:text-white/70">
                                    {phoneNumber}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 dark:text-white/30">
                                  Sin teléfono
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="py-5 pr-6">
                              {isPending ? (
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
                                    <MailCheck className="h-3 w-3 mr-1" />
                                    Pendiente
                                  </Badge>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelInvitation(member.id);
                                    }}
                                    disabled={cancelingInvitation === member.id}
                                    className="h-7 w-7 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                                    title="Cancelar invitación"
                                  >
                                    <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                  </button>
                                </div>
                              ) : role === "owner" ? (
                                <Badge
                                  variant="default"
                                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-2 border-gray-900 dark:border-gray-100 font-semibold"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  {formatRole(role)}
                                </Badge>
                              ) : role === "administrator" ? (
                                <Badge
                                  variant="outline"
                                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  {formatRole(role)}
                                </Badge>
                              ) : role === "seller" ? (
                                <Badge
                                  variant="outline"
                                  className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                                >
                                  {formatRole(role)}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 bg-gray-50 dark:bg-white/[0.02]"
                                >
                                  {formatRole(role)}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "general" && organization && (
            <EditOrganizationForm
              organization={organization}
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === "procesadores" && organization && (
            <AdminPaymentSettings
              organization={organization}
              currentUserRole={currentUserRole}
              mpOauthUrl={mpOauthUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
}
