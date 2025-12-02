"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ExternalLink, Shield, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * Dialog component for adding a new payment processor
 */
export default function AddPaymentProcessorDialog({
  mpOauthUrl,
}: {
  mpOauthUrl: string;
}) {

  return (
    <Dialog>

      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Procesador de Pago
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center pb-2">
          <DialogTitle>Conectar Procesador de Pago</DialogTitle>
          <DialogDescription>
            Elige un procesador de pago para comenzar a recibir pagos de tus clientes de forma segura.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="space-y-4">
            {/* MercadoPago Option */}
            <div className="group relative overflow-hidden border rounded-xl hover:border-accent transition-all duration-200 hover:shadow-md">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 flex items-center justify-center">
                      <Image
                        src="/MP_RGB_HANDSHAKE_color_vertical.svg"
                        alt="MercadoPago"
                        width={48}
                        height={48}
                        className="h-10 w-auto"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold">MercadoPago</div>
                      <div className="text-sm text-muted-foreground">
                        Solución de pagos líder en Latinoamérica
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span>Seguridad Bancaria</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>Soporte Local</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href={mpOauthUrl}>
                    <Button size="sm" className="min-w-[80px]">
                      Conectar
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
