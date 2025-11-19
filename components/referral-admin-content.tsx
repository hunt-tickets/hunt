"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  Users,
  TrendingUp,
  DollarSign,
  Gift,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReferralAdminContentProps {
  userId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ReferralAdminContent({ userId }: ReferralAdminContentProps) {
  const [copied, setCopied] = useState(false);

  // Mock data - esto se reemplazará con datos reales de la API/base de datos
  const referralCode = "HUNT2024XYZ";
  const referralLink = `https://hunt-tickets.com/sign-up?ref=${referralCode}`;

  const stats = {
    totalReferrals: 12,
    activeProducers: 8,
    totalEarnings: 2450000,
    pendingEarnings: 350000,
  };

  const referredProducers = [
    {
      id: "1",
      name: "Eventos Élite",
      joinDate: "2024-10-15",
      status: "Activo",
      eventsCreated: 5,
      yourEarnings: 450000,
    },
    {
      id: "2",
      name: "Producciones Premium",
      joinDate: "2024-09-22",
      status: "Activo",
      eventsCreated: 8,
      yourEarnings: 680000,
    },
    {
      id: "3",
      name: "Night Events",
      joinDate: "2024-10-01",
      status: "Activo",
      eventsCreated: 3,
      yourEarnings: 220000,
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Referral Info Section - 2 Columns */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Left Column - Referral Code */}
        <Card className="bg-white/[0.02] border-white/10 min-w-0">
          <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-white/60" />
              <span className="text-sm sm:text-base font-semibold text-white">Tu Código de Referido</span>
            </div>

            <div className="flex items-center justify-center p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10">
              <code className="text-xl sm:text-3xl font-bold tracking-wider text-white">
                {referralCode}
              </code>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 sm:px-5 py-3 sm:py-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs sm:text-sm text-white/60 truncate font-mono">
                  {referralLink}
                </span>
              </div>
              <Button
                onClick={handleCopyLink}
                size="lg"
                className="w-full gap-2 bg-white text-black hover:bg-white/90 rounded-xl h-11 sm:h-12 font-semibold text-sm sm:text-base"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                    Copiar Link
                  </>
                )}
              </Button>
            </div>

            <div className="pt-2 sm:pt-4">
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                Comparte este enlace con productores de eventos para ganar el <span className="font-semibold text-white">5% de comisión</span> en todas sus ventas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Benefits */}
        <Card className="bg-gradient-to-br from-gray-50 via-white to-gray-100 border-0 shadow-lg min-w-0">
          <CardContent className="p-4 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-lg bg-black/5">
                <Gift className="h-5 w-5 text-black/70" />
              </div>
              <h3 className="text-base font-bold text-black">Beneficios del Programa</h3>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white shrink-0">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1 text-black">Comisiones de por vida</h4>
                  <p className="text-xs text-black/60 leading-relaxed">
                    Gana el 5% mientras tus referidos permanezcan activos, sin límite de tiempo ni restricciones.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white shrink-0">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1 text-black">Sin límite de referidos</h4>
                  <p className="text-xs text-black/60 leading-relaxed">
                    Refiere tantos productores como quieras y multiplica tus ganancias exponencialmente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white shrink-0">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1 text-black">Pagos automáticos</h4>
                  <p className="text-xs text-black/60 leading-relaxed">
                    Recibe tus comisiones automáticamente cada 15 días directamente en tu cuenta bancaria.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black text-white shrink-0">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1 text-black">Panel en tiempo real</h4>
                  <p className="text-xs text-black/60 leading-relaxed">
                    Monitorea tus referidos, ganancias y estadísticas detalladas en cualquier momento.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="bg-white/[0.02] border-white/5 min-w-0">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40" />
              <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">Total Referidos</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{stats.totalReferrals}</div>
            <p className="text-[10px] sm:text-xs text-white/30">
              {stats.activeProducers} activos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 min-w-0">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40" />
              <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">Comisión Total</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-[10px] sm:text-xs text-green-400/60">
              +24% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 min-w-0">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40" />
              <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">Por Liquidar</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{formatCurrency(stats.pendingEarnings)}</div>
            <p className="text-[10px] sm:text-xs text-white/30">
              Próximo pago: 15 Dic
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 min-w-0">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40" />
              <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">Tasa Comisión</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">5%</div>
            <p className="text-[10px] sm:text-xs text-white/30">
              De cada evento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referred Producers Table */}
      <Card className="bg-white/[0.02] border-white/5 min-w-0">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-semibold">Productores Referidos</h3>
            <p className="text-xs sm:text-sm text-white/40">
              {referredProducers.length} productor{referredProducers.length !== 1 ? "es" : ""} referido
              {referredProducers.length !== 1 ? "s" : ""}
            </p>
          </div>

          {referredProducers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 mb-2">
                Aún no has referido ningún productor
              </p>
              <p className="text-sm text-white/30">
                Comparte tu código de referido para empezar a ganar comisiones
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {referredProducers.map((producer) => (
                  <div
                    key={producer.id}
                    className="p-4 rounded-lg bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{producer.name}</h4>
                        <p className="text-xs text-white/40">
                          {new Date(producer.joinDate).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-400 border-green-500/20 text-xs"
                      >
                        {producer.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-white/40 mb-1">Eventos</p>
                        <p className="text-sm font-semibold">{producer.eventsCreated}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/40 mb-1">Tus Ganancias</p>
                        <p className="text-sm font-semibold">{formatCurrency(producer.yourEarnings)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/60">Productor</TableHead>
                      <TableHead className="text-white/60">Fecha Registro</TableHead>
                      <TableHead className="text-white/60">Estado</TableHead>
                      <TableHead className="text-right text-white/60">Eventos</TableHead>
                      <TableHead className="text-right text-white/60">Tus Ganancias</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referredProducers.map((producer) => (
                      <TableRow key={producer.id} className="border-white/5">
                        <TableCell className="font-medium">{producer.name}</TableCell>
                        <TableCell className="text-white/60">
                          {new Date(producer.joinDate).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-400 border-green-500/20"
                          >
                            {producer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{producer.eventsCreated}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(producer.yourEarnings)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
