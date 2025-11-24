import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Settings } from "lucide-react";
import PaymentSettings from "./organization-payment-accounts-settings";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentAccounts?: any[];
}

interface AdminPaymentSettingsProps {
  organization: Organization;
  currentUserRole: string;
}

export async function AdminPaymentSettings({
  organization,
  currentUserRole,
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
              Solo los propietarios pueden gestionar los procesadores de pago de la
              organización
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no payment accounts, show empty state
  if (!organization.paymentAccounts || organization.paymentAccounts.length === 0) {
    return (
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="h-12 w-12 text-white/40 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Conecta un procesador de pago
            </h3>
            <p className="text-sm text-white/60 max-w-md mb-6">
              Conecta MercadoPago, Stripe o Toast POS para comenzar a recibir pagos
            </p>
            <PaymentSettings org={organization} />
          </div>
        </CardContent>
      </Card>
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
              <p className="text-xs sm:text-sm text-white/50">Total Procesadores</p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {organization.paymentAccounts?.length || 0}
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
                  organization.paymentAccounts?.filter((acc) => acc.status === "active")
                    .length
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
              <p className="text-xs sm:text-sm text-white/50">Pendientes</p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {
                  organization.paymentAccounts?.filter(
                    (acc) => acc.status === "pending"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings Component (wrapped in admin styling) */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <PaymentSettings org={organization} />
      </div>
    </div>
  );
}
