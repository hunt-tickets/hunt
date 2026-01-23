"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import PaymentSettings from "@/components/organization-payment-accounts-settings";
import type { OrganizationData } from "@/lib/schema";

interface AdminPaymentSettingsProps {
  organization: OrganizationData;
  currentUserRole: string;
  mpOauthUrl?: string;
}

export function AdminPaymentSettings({
  organization,
  currentUserRole,
  mpOauthUrl,
}: AdminPaymentSettingsProps) {
  // Only owners can manage payment processors
  const canManagePayments = currentUserRole === "owner";

  if (!canManagePayments) {
    return (
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Settings className="h-12 w-12 text-white/40 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Permisos insuficientes
            </h3>
            <p className="text-sm text-white/60 max-w-md">
              Solo los propietarios pueden gestionar los procesadores de pago de
              la organización
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no payment accounts, show available payment processors
  if (
    !organization.paymentProcessorAccount ||
    organization.paymentProcessorAccount.length === 0
  ) {
    return (
      <div className="space-y-6">
        {/* Available Processors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mercado Pago Card */}
          <div className="bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-8 hover:border-gray-300 dark:hover:border-[#3a3a3a] transition-colors">
            <div className="flex flex-col h-full items-center text-center">
              {/* Logo */}
              <div className="mb-6">
                <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center p-3">
                  <Image
                    src="/mercadopago-logo.webp"
                    alt="MercadoPago"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 mb-6">
                <h4 className="text-lg font-semibold">Mercado Pago</h4>
              </div>

              {/* Action Button */}
              <div className="w-full">
                {mpOauthUrl ? (
                  <Link href={mpOauthUrl} className="block">
                    <Button className="w-full bg-white/90 hover:bg-white text-black dark:bg-white/90 dark:hover:bg-white dark:text-black">
                      Conectar
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full">
                    No disponible
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Placeholder card for future processors */}
          <div className="bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-8 opacity-60">
            <div className="flex flex-col h-full items-center text-center">
              <div className="mb-6">
                <div className="h-16 w-16 bg-gray-200 dark:bg-[#2a2a2a] rounded-xl flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-gray-400 dark:text-white/30" />
                </div>
              </div>
              <div className="flex-1 mb-6">
                <h4 className="text-lg font-semibold text-gray-400 dark:text-white/40">
                  Próximamente
                </h4>
              </div>
              <div className="w-full">
                <Button disabled className="w-full">
                  Próximamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the payment settings with admin styling
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-white/50">
                Total Procesadores
              </p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {organization.paymentProcessorAccount?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-white/50">Activos</p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {
                  organization.paymentProcessorAccount?.filter(
                    (acc) => acc.status === "active",
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-white/50">Inactivos</p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {
                  organization.paymentProcessorAccount?.filter(
                    (acc) => acc.status === "inactive",
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings Component (wrapped in admin styling) */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <PaymentSettings org={organization} mpOauthUrl={mpOauthUrl} />
      </div>
    </div>
  );
}
