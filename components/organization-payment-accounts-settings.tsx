import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, CheckCircle, Clock, Wallet } from "lucide-react";
import AddPaymentProcessorDialog from "./add-payment-processor-dialog";
import { PaymentAccountActions } from "./payment-status-actions";
import { PaymentStatusSwitch } from "./payment-status-switch";
import Image from "next/image";
import type {
  PaymentProcessorType,
  PaymentProcessorAccount,
  OrganizationData,
} from "@/lib/schema";

interface PaymentSettingsProps {
  org: OrganizationData;
  mpOauthUrl?: string;
}

const PaymentSettings = ({ org, mpOauthUrl = "" }: PaymentSettingsProps) => {
  // Get payment accounts from the organization
  const paymentAccounts = org?.paymentAccounts || [];

  const formatProcessorName = (type: PaymentProcessorType) => {
    switch (type) {
      case "stripe":
        return "Stripe";
      case "mercadopago":
        return "MercadoPago";
      default:
        return String(type).charAt(0).toUpperCase() + String(type).slice(1);
    }
  };

  const getProcessorLogo = (type: PaymentProcessorType) => {
    switch (type) {
      case "stripe":
        return (
          <div className="h-8 w-8 flex items-center justify-center">
            Stripe{" "}
          </div>
        );
      case "mercadopago":
        return (
          <div className="h-8 w-8 flex items-center justify-center">
            <Image
              src="/MP_RGB_HANDSHAKE_color_vertical.svg"
              alt="MercadoPago"
              width={32}
              height={32}
              className="h-6 w-auto"
            />
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center shadow-sm">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Procesadores de pagos
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Conectar y administrar procesadores de pagos para aceptar
              pagos{" "}
            </CardDescription>
            {paymentAccounts.length > 0 && (
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                  {
                    paymentAccounts.filter((acc) => acc.status === "active")
                      .length
                  }{" "}
                  Active
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 bg-red-500 rounded-full"></div>
                  {
                    paymentAccounts.filter((acc) => acc.status === "suspended")
                      .length
                  }{" "}
                  Suspended
                </div>
              </div>
            )}
          </div>
          {paymentAccounts.length > 0 && (
            <div className="flex-shrink-0">
              {org && <AddPaymentProcessorDialog mpOauthUrl={mpOauthUrl} />}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {paymentAccounts.length > 0 ? (
          <div className="space-y-3">
            {/* Connected Accounts Section */}
            <div className="space-y-3">
              {/* Enhanced Grid Layout */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                {paymentAccounts.map((account: PaymentProcessorAccount) => (
                  <div
                    key={account.id}
                    className="group relative overflow-hidden rounded-lg border bg-gradient-to-r from-card to-card/50 transition-all duration-200 hover:shadow-md hover:shadow-primary/5 hover:border-primary/30"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        {/* Account Info */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Logo */}
                          <div className="flex-shrink-0">
                            {getProcessorLogo(account.processorType)}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-foreground text-sm">
                                  {formatProcessorName(account.processorType)}
                                </h4>
                                <PaymentStatusSwitch
                                  accountId={account.id}
                                  currentStatus={account.status}
                                  processorName={formatProcessorName(
                                    account.processorType
                                  )}
                                />
                              </div>
                              {account.processorType === "mercadopago" &&
                              account.metadata &&
                              typeof account.metadata === "object" &&
                              "email" in account.metadata &&
                              typeof account.metadata.email === "string" ? (
                                <p className="text-xs text-muted-foreground">
                                  {account.metadata.email}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-mono">
                                    {account.processorAccountId}
                                  </span>
                                </p>
                              )}
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              {account.processorType === "mercadopago" &&
                                account.metadata &&
                                typeof account.metadata === "object" &&
                                "live_mode" in account.metadata &&
                                typeof account.metadata.live_mode === "boolean" && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <div
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      account.metadata.live_mode
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                    }`}
                                  />
                                  <span className="text-muted-foreground">
                                    {account.metadata.live_mode
                                      ? "Live"
                                      : "Test"}
                                  </span>
                                </div>
                              )}

                              {account.processorType === "mercadopago" &&
                                account.metadata &&
                                typeof account.metadata === "object" &&
                                "country_id" in account.metadata &&
                                typeof account.metadata.country_id === "string" && (
                                <div className="text-xs text-muted-foreground">
                                  {account.metadata.country_id}
                                </div>
                              )}

                              {account.tokenExpiresAt && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Expires{" "}
                                    {new Date(
                                      account.tokenExpiresAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}

                              <div className="text-xs text-muted-foreground">
                                Connected{" "}
                                {new Date(
                                  account.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 ml-4">
                          <PaymentAccountActions
                            accountId={account.id}
                            processorName={formatProcessorName(
                              account.processorType
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Enhanced Empty State */
          <div className="flex flex-col items-center justify-center text-center py-8 px-4">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              <div className="relative rounded-full bg-gradient-to-br from-blue-50 to-purple-50 p-4 border border-blue-100">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="text-base font-semibold text-foreground">
                Start Accepting Payments
              </h3>
              <p className="text-muted-foreground text-xs max-w-lg">
                Connect your first payment processor to enable QR code payments
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-2xl">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1.5" />
                <p className="text-xs font-medium">Secure Payments</p>
                <p className="text-xs text-muted-foreground">
                  Bank-grade security
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
                <p className="text-xs font-medium">Fast Setup</p>
                <p className="text-xs text-muted-foreground">
                  Ready in minutes
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <CreditCard className="h-5 w-5 text-purple-600 mx-auto mb-1.5" />
                <p className="text-xs font-medium">Multiple Options</p>
                <p className="text-xs text-muted-foreground">
                  Cards, digital wallets
                </p>
              </div>
            </div>

            {org && <AddPaymentProcessorDialog mpOauthUrl={mpOauthUrl} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSettings;
