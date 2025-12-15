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
  Info,
  Calendar,
  BarChart3,
  Ticket,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/referrals/currency";
import { generateReferralData } from "@/lib/referrals/mock-data";
import type { ReferralAdminContentProps, ReferredProducer } from "@/lib/referrals/types";

// TODO: Replace with real API data
const MOCK_REFERRAL_DATA = generateReferralData();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ReferralAdminContent({ userId }: ReferralAdminContentProps) {
  const [copied, setCopied] = useState(false);
  const [selectedProducer, setSelectedProducer] = useState<ReferredProducer | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const referralLink = `${MOCK_REFERRAL_DATA.baseUrl}?ref=${MOCK_REFERRAL_DATA.referralCode}`;
  const { stats, referredProducers } = MOCK_REFERRAL_DATA;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          role="region"
          aria-label="Estadísticas de referidos"
        >
          <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 min-w-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-white/40" aria-hidden="true" />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Total Referidos</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white" aria-label={`${stats.totalReferrals} referidos totales`}>{stats.totalReferrals}</div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-white/30">
                {stats.activeProducers} activos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 min-w-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-white/40" aria-hidden="true" />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Comisión Total</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white" aria-label={`Comisión total: ${formatCurrency(stats.totalEarnings)}`}>{formatCurrency(stats.totalEarnings)}</div>
              <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400/60">
                +24% vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 min-w-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-white/40" aria-hidden="true" />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Por Liquidar</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white" aria-label={`Pendiente por liquidar: ${formatCurrency(stats.pendingEarnings)}`}>{formatCurrency(stats.pendingEarnings)}</div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-white/30">
                Próximo pago: 15 Dic
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 min-w-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 dark:text-white/40" aria-hidden="true" />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">Tasa Comisión</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white" aria-label={`Tasa de comisión: ${MOCK_REFERRAL_DATA.referralCommissionRate}%`}>{MOCK_REFERRAL_DATA.referralCommissionRate}%</div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-white/30">
                Del ingreso neto de Hunt
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referred Producers Table */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 min-w-0">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Productores Referidos</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-white/40">
                {referredProducers.length} productor{referredProducers.length !== 1 ? "es" : ""} referido
                {referredProducers.length !== 1 ? "s" : ""}
              </p>
            </div>

            {referredProducers.length === 0 ? (
              <div className="text-center py-12" role="status">
                <Users className="h-12 w-12 text-gray-300 dark:text-white/20 mx-auto mb-4" aria-hidden="true" />
                <p className="text-gray-500 dark:text-white/40 mb-2">
                  Aún no has referido ningún productor
                </p>
                <p className="text-sm text-gray-400 dark:text-white/30">
                  Comparte tu código de referido para empezar a ganar comisiones
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3" role="list" aria-label="Lista de productores referidos">
                  {referredProducers.map((producer) => (
                    <div
                      key={producer.id}
                      className="p-4 rounded-lg bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5"
                      role="listitem"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">{producer.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-white/40">
                            {formatDate(producer.joinDate, 'SHORT')}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/20 text-xs"
                        >
                          {producer.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-white/40 mb-1">Eventos</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white" aria-label={`${producer.eventsCreated} eventos creados`}>{producer.eventsCreated}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 dark:text-white/40 mb-1">Tus Ganancias</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white" aria-label={`Tus ganancias: ${formatCurrency(producer.yourEarnings)}`}>{formatCurrency(producer.yourEarnings)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-white/5 hover:bg-transparent">
                        <TableHead className="text-gray-600 dark:text-white/60">Productor</TableHead>
                        <TableHead className="text-gray-600 dark:text-white/60">Fecha Registro</TableHead>
                        <TableHead className="text-gray-600 dark:text-white/60">Estado</TableHead>
                        <TableHead className="text-right text-gray-600 dark:text-white/60">Eventos</TableHead>
                        <TableHead className="text-right text-gray-600 dark:text-white/60">Tus Ganancias</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referredProducers.map((producer) => {
                        const handleRowClick = () => {
                          setSelectedProducer(producer);
                          setIsSheetOpen(true);
                        };

                        const handleKeyDown = (e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleRowClick();
                          }
                        };

                        return (
                          <TableRow
                            key={producer.id}
                            onClick={handleRowClick}
                            onKeyDown={handleKeyDown}
                            tabIndex={0}
                            role="button"
                            aria-label={`Ver detalles de ${producer.name}`}
                            className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/30 transition-all duration-200 cursor-pointer"
                          >
                            <TableCell className="font-medium text-gray-900 dark:text-white">{producer.name}</TableCell>
                            <TableCell className="text-gray-600 dark:text-white/60">
                              {formatDate(producer.joinDate, 'SHORT')}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/20"
                              >
                                {producer.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-gray-900 dark:text-white">{producer.eventsCreated}</TableCell>
                            <TableCell className="text-right font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(producer.yourEarnings)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Referral Info Section - 2 Columns */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Left Column - Referral Code */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 min-w-0">
          <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-gray-400 dark:text-white/40" aria-hidden="true" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Tu Código de Referido</h3>
            </div>

            <div
              className="flex items-center justify-center p-4 sm:p-6 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/5"
              role="region"
              aria-label="Código de referido"
            >
              <code className="text-xl sm:text-3xl font-bold tracking-wider text-gray-900 dark:text-white">
                {MOCK_REFERRAL_DATA.referralCode}
              </code>
            </div>

            <div className="space-y-3">
              <div
                className="flex items-center gap-2 px-3 sm:px-5 py-3 sm:py-4 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/5"
                role="region"
                aria-label="Enlace de referido"
              >
                <span className="text-xs sm:text-sm text-gray-600 dark:text-white/60 truncate font-mono">
                  {referralLink}
                </span>
              </div>
              <Button
                onClick={handleCopyLink}
                size="lg"
                className="w-full gap-2 bg-black dark:bg-white text-white dark:text-gray-900 hover:bg-black/90 dark:hover:bg-white/90 rounded-xl h-11 sm:h-12 font-semibold text-sm sm:text-base"
                aria-label={copied ? "Enlace copiado al portapapeles" : "Copiar enlace de referido"}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    Copiar Link
                  </>
                )}
              </Button>
            </div>

            <div className="pt-2 sm:pt-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-white/40 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 leading-relaxed">
                  Comparte este enlace con organizaciones productoras de eventos. Tu organización ganará el{" "}
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold text-gray-900 dark:text-white underline decoration-dotted underline-offset-4 cursor-help">
                          {MOCK_REFERRAL_DATA.referralCommissionRate}% del ingreso neto de Hunt
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="max-w-xs sm:max-w-md p-4 bg-gray-50 dark:bg-[#1c1c1c] border-gray-200 dark:border-white/5"
                        sideOffset={5}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400 dark:text-white/40 mt-0.5 shrink-0" aria-hidden="true" />
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                              Cómo se calcula la comisión:
                            </p>
                          </div>

                          <div className="space-y-2 text-xs text-gray-600 dark:text-white/60 leading-relaxed">
                            <p className="font-semibold text-gray-900 dark:text-white">Ejemplo paso a paso:</p>

                            <div className="space-y-1.5 text-[11px]">
                              <p>1. Organización referida vende ticket de <span className="font-semibold text-gray-900 dark:text-white">$100,000</span></p>

                              <p>2. Hunt cobra {MOCK_REFERRAL_DATA.huntCommissionRate}% del ticket = <span className="font-semibold text-gray-900 dark:text-white">$5,000</span></p>

                              <p>3. Hunt descuenta costos:</p>
                              <div className="pl-3 space-y-0.5 text-gray-500 dark:text-white/40">
                                <p>• Plataforma de pago</p>
                                <p>• IVA sobre servicios</p>
                                <p>• Costos operativos</p>
                              </div>

                              <p>4. Ingreso neto de Hunt = <span className="font-semibold text-gray-900 dark:text-white">$3,000</span></p>

                              <p>5. Tu organización recibe {MOCK_REFERRAL_DATA.referralCommissionRate}% = <span className="font-semibold text-gray-900 dark:text-white">$150</span></p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200 dark:border-white/5">
                            <p className="text-[10px] text-gray-500 dark:text-white/30 italic">
                              La comisión se paga a tu organización y se calcula sobre el ingreso neto de Hunt (después de costos).
                            </p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {" "}por cada venta de tickets de los eventos referidos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Benefits */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 min-w-0">
          <CardContent className="p-4 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Gift className="h-5 w-5 text-gray-400 dark:text-white/40" aria-hidden="true" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Beneficios del Programa</h3>
            </div>

            <ul className="space-y-5" role="list" aria-label="Lista de beneficios del programa de referidos">
              <li className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-gray-900 shrink-0" aria-hidden="true">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1 text-gray-900 dark:text-white">Comisiones de por vida</h4>
                  <p className="text-xs text-gray-600 dark:text-white/60 leading-relaxed">
                    Tu organización gana el {MOCK_REFERRAL_DATA.referralCommissionRate}% del ingreso neto de Hunt mientras tus referidos permanezcan activos, sin límite de tiempo ni restricciones.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-gray-900 shrink-0" aria-hidden="true">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1 text-gray-900 dark:text-white">Sin límite de referidos</h4>
                  <p className="text-xs text-gray-600 dark:text-white/60 leading-relaxed">
                    Refiere tantos productores como quieras y multiplica tus ganancias exponencialmente.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-gray-900 shrink-0" aria-hidden="true">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1 text-gray-900 dark:text-white">Pagos automáticos</h4>
                  <p className="text-xs text-gray-600 dark:text-white/60 leading-relaxed">
                    Recibe tus comisiones automáticamente cada 15 días directamente en tu cuenta bancaria.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-gray-900 shrink-0" aria-hidden="true">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1 text-gray-900 dark:text-white">Panel en tiempo real</h4>
                  <p className="text-xs text-gray-600 dark:text-white/60 leading-relaxed">
                    Monitorea tus referidos, ganancias y estadísticas detalladas en cualquier momento.
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Producer Detail Sheet */}
      {selectedProducer && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a] p-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="p-6 space-y-6">
              <SheetHeader className="space-y-2 p-0">
                <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalles del Productor
                </SheetTitle>
                <SheetDescription className="text-sm text-gray-500 dark:text-white/50">
                  Información detallada y estadísticas del productor referido
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Producer Info Header */}
                <div className="flex items-start gap-4 p-6 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                  <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0 font-bold text-xl text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-white/10">
                    {selectedProducer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{selectedProducer.name}</h2>
                    <Badge
                      variant="outline"
                      className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/20 text-xs"
                    >
                      {selectedProducer.status}
                    </Badge>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 mb-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Fecha de Registro
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(selectedProducer.joinDate, 'SHORT')}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 mb-1">
                      <BarChart3 className="h-3.5 w-3.5" />
                      Eventos Creados
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedProducer.eventsCreated}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 mb-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      Tus Ganancias
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(selectedProducer.yourEarnings)}
                    </div>
                  </div>
                </div>

                {/* Performance Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Resumen de Actividad</h3>

                  <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600 dark:text-white/60">Eventos por Mes (Promedio)</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {(selectedProducer.eventsCreated / 3).toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/5 rounded-full h-2">
                      <div
                        className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((selectedProducer.eventsCreated / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-gray-400 dark:text-white/40" />
                        <span className="text-sm text-gray-600 dark:text-white/60">Ganancia por Evento</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(selectedProducer.yourEarnings / selectedProducer.eventsCreated)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
