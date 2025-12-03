"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Settings, Mail, Shield, MoreVertical, Trash2, Edit, CreditCard, MailCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { PendingInvitationsList } from "@/components/pending-invitations-list";
import { EditOrganizationForm } from "@/components/edit-organization-form";
import { AdminPaymentSettings } from "@/components/admin-payment-settings";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invitations?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentAccounts?: any[];
}

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
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
  organization: Organization | null;
  team: TeamMember[];
  invitations: Invitation[];
  currentUserRole: string;
}

type TabType = "invitaciones" | "configuracion";
type ConfigSubTab = "general" | "equipo" | "procesadores";

export function AdminConfigTabs({
  organization,
  team,
  invitations,
  currentUserRole,
}: AdminConfigTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("configuracion");
  const [activeConfigSubTab, setActiveConfigSubTab] = useState<ConfigSubTab>("general");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number; above: boolean } | null>(null);

  const displayTeam = team.length > 0 ? team : [];

  // Check permissions
  const canInvite = currentUserRole === "owner" || currentUserRole === "administrator";

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
    { value: "configuracion", icon: Settings, label: "Configuración" },
    { value: "invitaciones", icon: MailCheck, label: "Invitaciones" },
  ] as const;

  const configSubTabs = [
    { value: "general", icon: Settings, label: "General" },
    { value: "equipo", icon: Users, label: "Equipo" },
    { value: "procesadores", icon: CreditCard, label: "Procesadores" },
  ] as const;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Main Tabs */}
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
                      ? "bg-white/10 text-white border border-white/20"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Add Member Button - Only show in Equipo sub-tab within Configuracion */}
          {activeTab === "configuracion" && activeConfigSubTab === "equipo" && organization && canInvite && (
            <div className="w-full sm:w-auto">
              <InviteMemberDialog organizationId={organization.id} />
            </div>
          )}
        </div>

        {/* Sub-tabs for Configuración */}
        {activeTab === "configuracion" && (
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {configSubTabs.map((subTab) => {
              const Icon = subTab.icon;
              const isActive = activeConfigSubTab === subTab.value;
              return (
                <button
                  key={subTab.value}
                  onClick={() => setActiveConfigSubTab(subTab.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white/[0.08] text-white border border-white/20"
                      : "bg-white/[0.03] text-white/50 hover:text-white/80 hover:bg-white/[0.05] border border-white/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{subTab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "invitaciones" && (
            <PendingInvitationsList invitations={invitations} currentUserRole={currentUserRole} />
          )}

          {activeTab === "configuracion" && activeConfigSubTab === "equipo" && (
            <div className="space-y-4">
              {/* Team Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-white/50">Total Miembros</p>
                      <p className="text-lg sm:text-xl font-bold text-white">
                        {displayTeam.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-white/50">Administradores</p>
                      <p className="text-lg sm:text-xl font-bold text-white">
                        {displayTeam.filter((m) => m.role === "administrator").length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-white/50">Propietarios</p>
                      <p className="text-lg sm:text-xl font-bold text-white">
                        {displayTeam.filter((m) => m.role === "owner").length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-white/50">Vendedores</p>
                      <p className="text-lg sm:text-xl font-bold text-white">
                        {displayTeam.filter((m) => m.role === "seller").length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Mobile Cards */}
              <div className="md:hidden space-y-3">
                {displayTeam.map((member) => {
                  const fullName = member.user?.name || "Usuario sin nombre";
                  const email = member.user?.email || "Sin correo";
                  const role = member.role || "member";

                  const initials = fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <Card key={member.id} className="bg-white/[0.02] border-white/10 min-w-0">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-11 w-11 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0 font-semibold text-sm text-white/90 ring-1 ring-white/10">
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white truncate">{fullName}</p>
                              {email !== "Sin correo" && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Mail className="h-3 w-3 text-white/40 flex-shrink-0" />
                                  <span className="text-xs text-white/60 truncate">{email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            {role === "owner" ? (
                              <Badge variant="default" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 border border-purple-500/20 text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                {formatRole(role)}
                              </Badge>
                            ) : role === "administrator" ? (
                              <Badge variant="default" className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20 text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                {formatRole(role)}
                              </Badge>
                            ) : role === "seller" ? (
                              <Badge variant="default" className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 border border-green-500/20 text-xs">
                                {formatRole(role)}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-white/10 text-white/50 bg-white/[0.02] text-xs">
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
              <div className="hidden md:block rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-white/5">
                        <TableHead className="font-medium text-white/50 py-3 pl-6 text-xs uppercase tracking-wider">
                          Miembro
                        </TableHead>
                        <TableHead className="font-medium text-white/50 text-xs uppercase tracking-wider">
                          Contacto
                        </TableHead>
                        <TableHead className="font-medium text-white/50 text-xs uppercase tracking-wider">
                          Rol
                        </TableHead>
                        <TableHead className="font-medium text-white/50 text-xs uppercase tracking-wider text-center pr-6">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayTeam.map((member) => {
                        const fullName = member.user?.name || "Usuario sin nombre";
                        const email = member.user?.email || "Sin correo";
                        const role = member.role || "member";

                        const initials = fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);

                        return (
                          <TableRow
                            key={member.id}
                            onClick={(e) => {
                              const clickY = e.clientY;
                              const clickX = e.clientX;
                              const windowHeight = window.innerHeight;

                              const spaceBelow = windowHeight - clickY;
                              const menuHeight = 150;
                              const showAbove = spaceBelow < menuHeight;

                              if (openDropdownId === member.id) {
                                setOpenDropdownId(null);
                                setMenuPosition(null);
                              } else {
                                setOpenDropdownId(member.id);
                                setMenuPosition({ x: clickX, y: clickY, above: showAbove });
                              }
                            }}
                            className="border-b border-white/5 hover:bg-white/[0.02] transition-all duration-200 group cursor-pointer"
                          >
                            <TableCell className="py-5 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0 font-semibold text-sm text-white/90 ring-1 ring-white/10">
                                  {initials}
                                </div>
                                <div className="flex flex-col min-w-0 gap-0.5">
                                  <span className="font-medium text-white truncate">{fullName}</span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-5">
                              {email !== "Sin correo" ? (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3.5 w-3.5 text-white/40" />
                                  <span className="text-sm text-white/70">{email}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-white/30">Sin correo</span>
                              )}
                            </TableCell>

                            <TableCell className="py-5">
                              {role === "owner" ? (
                                <Badge
                                  variant="default"
                                  className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 border border-purple-500/20"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  {formatRole(role)}
                                </Badge>
                              ) : role === "administrator" ? (
                                <Badge
                                  variant="default"
                                  className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20"
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  {formatRole(role)}
                                </Badge>
                              ) : role === "seller" ? (
                                <Badge
                                  variant="default"
                                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 border border-green-500/20"
                                >
                                  {formatRole(role)}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-white/10 text-white/50 bg-white/[0.02]"
                                >
                                  {formatRole(role)}
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="text-center py-5 pr-6">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center">
                                <MoreVertical className="h-4 w-4 text-white/60" />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Context Menu */}
              {openDropdownId && menuPosition && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setOpenDropdownId(null);
                      setMenuPosition(null);
                    }}
                  />
                  <div
                    className="fixed z-50 w-48 bg-[#1a1a1a] border border-white/10 shadow-xl rounded-xl p-2"
                    style={{
                      left: `${menuPosition.x}px`,
                      top: `${menuPosition.y}px`,
                      transform: menuPosition.above ? "translate(-50%, -100%)" : "translate(-50%, 0)",
                    }}
                  >
                    <button
                      className="w-full cursor-pointer rounded-lg px-3 py-2.5 hover:bg-white/[0.08] focus:bg-white/[0.08] transition-colors text-left"
                      onClick={() => {
                        setOpenDropdownId(null);
                        setMenuPosition(null);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Edit className="h-4 w-4 text-white/60" />
                        <span className="text-sm font-medium text-white">Cambiar Rol</span>
                      </div>
                    </button>

                    <div className="my-2 h-px bg-white/5" />

                    <button
                      className="w-full cursor-pointer rounded-lg px-3 py-2.5 hover:bg-red-500/10 focus:bg-red-500/10 transition-colors text-left group"
                      onClick={() => {
                        setOpenDropdownId(null);
                        setMenuPosition(null);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="h-4 w-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400 group-hover:text-red-300">
                          Eliminar
                        </span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "configuracion" && activeConfigSubTab === "general" && organization && (
            <EditOrganizationForm organization={organization} currentUserRole={currentUserRole} />
          )}

          {activeTab === "configuracion" && activeConfigSubTab === "procesadores" && organization && (
            <AdminPaymentSettings organization={organization} currentUserRole={currentUserRole} />
          )}
        </div>
      </div>
    </div>
  );
}
