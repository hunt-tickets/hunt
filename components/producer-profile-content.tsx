"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, LayoutDashboard, Settings, Mail, Shield, MoreVertical, Trash2, Edit, Download, HelpCircle } from "lucide-react";
import ReactECharts from 'echarts-for-react';
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddTeamMemberDialog } from "@/components/add-team-member-dialog";

interface Producer {
  id: string;
  name: string | null;
  logo: string | null;
  created_at: string;
}

interface TeamMember {
  id: string;
  rol: string | null;
  profile: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string | null;
  };
}

interface ProducerProfileContentProps {
  producer: Producer;
  team: TeamMember[];
  userId: string;
}

type TabType = "dashboard" | "equipo" | "configuracion";

export function ProducerProfileContent({ producer, team, userId }: ProducerProfileContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number; above: boolean } | null>(null);
  const [timeRange, setTimeRange] = useState<"3" | "6" | "12">("12");

  const displayName = producer.name || "Sin nombre";

  // Temporary fake data for team
  const fakeTeam: TeamMember[] = [
    {
      id: "1",
      rol: "Dueño",
      profile: {
        id: "1",
        name: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
      },
    },
    {
      id: "2",
      rol: "Administrador",
      profile: {
        id: "2",
        name: "María",
        lastName: "González",
        email: "maria.gonzalez@example.com",
      },
    },
    {
      id: "3",
      rol: "Analista",
      profile: {
        id: "3",
        name: "Carlos",
        lastName: "Rodríguez",
        email: "carlos.rodriguez@example.com",
      },
    },
    {
      id: "4",
      rol: "Vendedor",
      profile: {
        id: "4",
        name: "Ana",
        lastName: "Martínez",
        email: "ana.martinez@example.com",
      },
    },
  ];

  // Use fake team if real team is empty
  const displayTeam = team.length > 0 ? team : fakeTeam;

  const tabs = [
    { value: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { value: "equipo", icon: Users, label: "Equipo" },
    { value: "configuracion", icon: Settings, label: "Configuración" },
  ] as const;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Header with producer info */}
        <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Producer Logo */}
          <div className="flex-shrink-0">
            {producer.logo ? (
              <img
                src={producer.logo}
                alt={displayName}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-white/10"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-white/10">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            )}
          </div>

          {/* Producer Name and Breadcrumb */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href={`/profile/${userId}/administrador/marcas`} className="hover:text-white transition-colors">
                Marcas
              </Link>
              <span>/</span>
              <span className="text-white truncate">{displayName}</span>
            </div>
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl truncate">{displayName}</h1>
            <p className="text-xs text-muted-foreground">Productor</p>
          </div>
        </div>
      </div>

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

        {/* Add Member Button - Only show in Equipo tab */}
        {activeTab === "equipo" && (
          <div className="w-full sm:w-auto">
            <AddTeamMemberDialog producerId={producer.id} />
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Monthly Sales Chart */}
            <Card className="bg-white/[0.02] border-white/10 min-w-0">
              <CardContent className="pt-6">
                <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Ventas Mensuales</h3>
                    <p className="text-xs sm:text-sm text-white/50">Ingresos por mes</p>
                  </div>

                  {/* Time Range Filters and Actions */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => setTimeRange("3")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                          timeRange === "3"
                            ? "bg-white/10 text-white border border-white/20"
                            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        3M
                      </button>
                      <button
                        onClick={() => setTimeRange("6")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                          timeRange === "6"
                            ? "bg-white/10 text-white border border-white/20"
                            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        6M
                      </button>
                      <button
                        onClick={() => setTimeRange("12")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                          timeRange === "12"
                            ? "bg-white/10 text-white border border-white/20"
                            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        12M
                      </button>

                      {/* Help Icon with Tooltip */}
                      <div className="relative group">
                        <button className="flex items-center justify-center h-6 w-6 rounded-full transition-all bg-white/5 hover:bg-white/10 border border-white/10">
                          <HelpCircle className="h-3.5 w-3.5 text-white/60" />
                        </button>

                        {/* Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                          <div className="bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                            <div className="text-white/80">Selecciona el rango de tiempo para visualizar</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-white/90 hover:bg-white text-black border border-white/80">
                      Ventas Históricas
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dummy chart bars */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-end gap-2 h-48">
                    {[
                      { month: 'Ene', value: 65, amount: '$12,450', tickets: 456 },
                      { month: 'Feb', value: 78, amount: '$15,230', tickets: 523 },
                      { month: 'Mar', value: 92, amount: '$18,920', tickets: 678 },
                      { month: 'Abr', value: 58, amount: '$10,780', tickets: 389 },
                      { month: 'May', value: 85, amount: '$16,430', tickets: 598 },
                      { month: 'Jun', value: 100, amount: '$21,340', tickets: 756 },
                      { month: 'Jul', value: 72, amount: '$14,120', tickets: 502 },
                      { month: 'Ago', value: 88, amount: '$17,650', tickets: 634 },
                      { month: 'Sep', value: 95, amount: '$19,890', tickets: 712 },
                      { month: 'Oct', value: 82, amount: '$16,320', tickets: 587 },
                      { month: 'Nov', value: 70, amount: '$13,580', tickets: 489 },
                      { month: 'Dic', value: 90, amount: '$18,450', tickets: 658 }
                    ].slice(-parseInt(timeRange)).map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center relative group">
                        {/* Bar */}
                        <div className="w-full flex flex-col justify-end" style={{ height: '160px' }}>
                          <div
                            className="w-full bg-white/[0.18] border border-white/20 rounded-t-lg transition-all duration-300 hover:bg-white/[0.28] hover:border-white/30 relative cursor-pointer overflow-hidden"
                            style={{ height: `${data.value}%` }}
                          >
                            {/* Dot pattern */}
                            <div
                              className="absolute inset-0 opacity-30 pointer-events-none"
                              style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 0.3px, transparent 0.3px)',
                                backgroundSize: '6px 6px'
                              }}
                            />
                          </div>
                        </div>

                        {/* Tooltip on hover - Outside the bar */}
                        <div className="absolute bottom-[170px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                            <div className="font-semibold text-white mb-1">{data.month}</div>
                            <div className="text-white/80 mb-0.5">{data.amount}</div>
                            <div className="text-white/60 text-[10px]">{data.tickets} tickets</div>
                          </div>
                        </div>

                        {/* Month label */}
                        <span className="text-xs text-white/50 mt-2">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/10">
                  <div className="text-center p-3 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.02] sm:bg-transparent border sm:border-0 border-white/5">
                    <div className="text-xs text-white/40 mb-1">
                      {timeRange === "12" ? "Total Anual" : `Total ${timeRange} meses`}
                    </div>
                    <div className="text-base sm:text-lg font-bold">
                      {timeRange === "12" && "$195,160"}
                      {timeRange === "6" && "$102,570"}
                      {timeRange === "3" && "$48,650"}
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.02] sm:bg-transparent border sm:border-0 border-white/5">
                    <div className="text-xs text-white/40 mb-1">Promedio Mensual</div>
                    <div className="text-base sm:text-lg font-bold">
                      {timeRange === "12" && "$16,263"}
                      {timeRange === "6" && "$17,095"}
                      {timeRange === "3" && "$16,217"}
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.02] sm:bg-transparent border sm:border-0 border-white/5">
                    <div className="text-xs text-white/40 mb-1">Mejor Mes</div>
                    <div className="text-base sm:text-lg font-bold">
                      {timeRange === "12" && "Jun - $21,340"}
                      {timeRange === "6" && "Sep - $19,890"}
                      {timeRange === "3" && "Nov - $13,580"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age and Gender Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <Card className="bg-white/[0.02] border-white/10 min-w-0">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Distribución por Edad</h3>
                    <p className="text-xs sm:text-sm text-white/50">Rango de edades del público</p>
                  </div>
                  <div className="h-[300px]">
                    <ReactECharts
                      option={{
                        backgroundColor: 'transparent',
                        tooltip: {
                          trigger: 'item',
                          backgroundColor: '#18181b',
                          borderColor: '#303030',
                          borderWidth: 1,
                          textStyle: { color: '#fff' },
                          formatter: '{b}: {c}%'
                        },
                        series: [{
                          type: 'pie',
                          radius: ['40%', '70%'],
                          center: ['50%', '50%'],
                          avoidLabelOverlap: false,
                          padAngle: 3,
                          itemStyle: {
                            borderRadius: 10,
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 2,
                            color: {
                              type: 'pattern',
                              image: (() => {
                                const canvas = document.createElement('canvas');
                                canvas.width = 6;
                                canvas.height = 6;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
                                  ctx.fillRect(0, 0, 6, 6);
                                  ctx.fillStyle = 'rgba(255, 255, 255, 0.30)';
                                  ctx.beginPath();
                                  ctx.arc(3, 3, 0.3, 0, Math.PI * 2);
                                  ctx.fill();
                                }
                                return canvas;
                              })(),
                              repeat: 'repeat'
                            }
                          },
                          label: {
                            show: true,
                            formatter: '{b}\n{d}%',
                            color: '#888',
                            fontSize: 11
                          },
                          emphasis: {
                            label: {
                              show: true,
                              fontSize: 13,
                              fontWeight: 'bold',
                              color: '#fff'
                            },
                            scale: false,
                            itemStyle: {
                              color: {
                                type: 'pattern',
                                image: (() => {
                                  const canvas = document.createElement('canvas');
                                  canvas.width = 6;
                                  canvas.height = 6;
                                  const ctx = canvas.getContext('2d');
                                  if (ctx) {
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
                                    ctx.fillRect(0, 0, 6, 6);
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
                                    ctx.beginPath();
                                    ctx.arc(3, 3, 0.3, 0, Math.PI * 2);
                                    ctx.fill();
                                  }
                                  return canvas;
                                })(),
                                repeat: 'repeat'
                              },
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              shadowBlur: 0
                            }
                          },
                          data: [
                            { name: '18-24 años', value: 35 },
                            { name: '25-34 años', value: 42 },
                            { name: '35-44 años', value: 18 },
                            { name: '45+ años', value: 5 }
                          ]
                        }]
                      }}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card className="bg-white/[0.02] border-white/10 min-w-0">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Distribución por Género</h3>
                    <p className="text-xs sm:text-sm text-white/50">Composición del público</p>
                  </div>
                  <div className="h-[300px]">
                    <ReactECharts
                      option={{
                        backgroundColor: 'transparent',
                        tooltip: {
                          trigger: 'item',
                          backgroundColor: '#18181b',
                          borderColor: '#303030',
                          borderWidth: 1,
                          textStyle: { color: '#fff' },
                          formatter: '{b}: {c}%'
                        },
                        series: [{
                          type: 'pie',
                          radius: ['40%', '70%'],
                          center: ['50%', '50%'],
                          avoidLabelOverlap: false,
                          padAngle: 3,
                          itemStyle: {
                            borderRadius: 10,
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 2,
                            color: {
                              type: 'pattern',
                              image: (() => {
                                const canvas = document.createElement('canvas');
                                canvas.width = 6;
                                canvas.height = 6;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
                                  ctx.fillRect(0, 0, 6, 6);
                                  ctx.fillStyle = 'rgba(255, 255, 255, 0.30)';
                                  ctx.beginPath();
                                  ctx.arc(3, 3, 0.3, 0, Math.PI * 2);
                                  ctx.fill();
                                }
                                return canvas;
                              })(),
                              repeat: 'repeat'
                            }
                          },
                          label: {
                            show: true,
                            formatter: '{b}\n{d}%',
                            color: '#888',
                            fontSize: 11
                          },
                          emphasis: {
                            label: {
                              show: true,
                              fontSize: 13,
                              fontWeight: 'bold',
                              color: '#fff'
                            },
                            scale: false,
                            itemStyle: {
                              color: {
                                type: 'pattern',
                                image: (() => {
                                  const canvas = document.createElement('canvas');
                                  canvas.width = 6;
                                  canvas.height = 6;
                                  const ctx = canvas.getContext('2d');
                                  if (ctx) {
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
                                    ctx.fillRect(0, 0, 6, 6);
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
                                    ctx.beginPath();
                                    ctx.arc(3, 3, 0.3, 0, Math.PI * 2);
                                    ctx.fill();
                                  }
                                  return canvas;
                                })(),
                                repeat: 'repeat'
                              },
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              shadowBlur: 0
                            }
                          },
                          data: [
                            { name: 'Masculino', value: 52 },
                            { name: 'Femenino', value: 45 },
                            { name: 'Otro', value: 3 }
                          ]
                        }]
                      }}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "equipo" && (
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
                        {displayTeam.filter(m => m.rol === "Administrador").length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-white/50">Analistas</p>
                      <p className="text-lg sm:text-xl font-bold text-white">
                        {displayTeam.filter(m => m.rol === "Analista").length}
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
                        {displayTeam.filter(m => m.rol === "Vendedor").length}
                      </p>
                    </div>
                  </div>
                </div>
            </div>

            {/* Team Mobile Cards */}
            <div className="md:hidden space-y-3">
              {displayTeam.map((member) => {
                const fullName = `${member.profile.name || ""} ${member.profile.lastName || ""}`.trim() || "Sin nombre";
                const email = member.profile.email || "Sin correo";
                const role = member.rol || "Sin rol";

                const initials = fullName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
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
                          {role === "Dueño" ? (
                            <Badge variant="default" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 border border-purple-500/20 text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Dueño
                            </Badge>
                          ) : role === "Administrador" ? (
                            <Badge variant="default" className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20 text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : role === "Analista" ? (
                            <Badge variant="default" className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-400 border border-blue-500/20 text-xs">
                              Analista
                            </Badge>
                          ) : role === "Vendedor" ? (
                            <Badge variant="default" className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 border border-green-500/20 text-xs">
                              Vendedor
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-white/10 text-white/50 bg-white/[0.02] text-xs">
                              {role}
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
                      const fullName = `${member.profile.name || ""} ${member.profile.lastName || ""}`.trim() || "Sin nombre";
                      const email = member.profile.email || "Sin correo";
                      const role = member.rol || "Sin rol";

                      const initials = fullName
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <TableRow
                          key={member.id}
                          onClick={(e) => {
                            const clickY = e.clientY;
                            const clickX = e.clientX;
                            const windowHeight = window.innerHeight;

                            // Check if there's enough space below, otherwise show above
                            const spaceBelow = windowHeight - clickY;
                            const menuHeight = 150; // Approximate menu height
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
                          {/* Miembro */}
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

                          {/* Contacto */}
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

                          {/* Rol */}
                          <TableCell className="py-5">
                            {role === "Dueño" ? (
                              <Badge
                                variant="default"
                                className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 border border-purple-500/20 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-200 shadow-sm"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Dueño
                              </Badge>
                            ) : role === "Administrador" ? (
                              <Badge
                                variant="default"
                                className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20 hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-200 shadow-sm"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                Administrador
                              </Badge>
                            ) : role === "Analista" ? (
                              <Badge
                                variant="default"
                                className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-400 border border-blue-500/20 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-200 shadow-sm"
                              >
                                Analista
                              </Badge>
                            ) : role === "Vendedor" ? (
                              <Badge
                                variant="default"
                                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 border border-green-500/20 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-200 shadow-sm"
                              >
                                Vendedor
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-white/10 text-white/50 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-200"
                              >
                                {role}
                              </Badge>
                            )}
                          </TableCell>

                          {/* Acciones */}
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
                    transform: menuPosition.above ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
                  }}
                >
                  <button
                    className="w-full cursor-pointer rounded-lg px-3 py-2.5 hover:bg-white/[0.08] focus:bg-white/[0.08] transition-colors text-left"
                    onClick={() => {
                      setOpenDropdownId(null);
                      setMenuPosition(null);
                      // Handle change role
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
                      // Handle delete
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400 group-hover:text-red-300">Eliminar</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "configuracion" && (
          <Card className="bg-white/[0.02] border-white/5 p-6 min-w-0">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Settings className="h-12 w-12 text-white/40 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Configuración</h3>
              <p className="text-sm text-white/60 max-w-md">
                Configura los ajustes del productor
              </p>
            </div>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}
