"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, HelpCircle } from "lucide-react";

const SupportPage = () => {
  const whatsappNumber = "+57 322 8597640";
  const supportEmail = "info@hunt-tickets.com";

  const handleWhatsAppClick = () => {
    const message = "Hola, necesito ayuda con mi cuenta de Hunt Tickets";
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Centro de Soporte</h1>
        <p className="text-muted-foreground mt-2">
          Contáctanos a través de WhatsApp o Email para recibir asistencia
        </p>
      </div>

      {/* Contact Buttons */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">WhatsApp</CardTitle>
                <CardDescription className="mt-1.5">
                  Respuesta rápida y directa
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleWhatsAppClick} className="w-full" size="lg">
              <MessageCircle className="mr-2 h-5 w-5" />
              Abrir WhatsApp
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                <Mail className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Email</CardTitle>
                <CardDescription className="mt-1.5">
                  Soporte por correo electrónico
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleEmailClick} className="w-full" size="lg">
              <Mail className="mr-2 h-5 w-5" />
              Enviar Email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Preguntas Frecuentes</CardTitle>
              <CardDescription className="mt-1.5">
                Encuentra respuestas rápidas a las preguntas más comunes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            <a href="#" className="text-sm text-primary p-2 rounded-md">
              ¿Cómo compro tickets?
            </a>
            <a href="#" className="text-sm text-primary p-2 rounded-md">
              ¿Puedo cancelar mi compra?
            </a>
            <a href="#" className="text-sm text-primary p-2 rounded-md">
              ¿Cómo recibo mis tickets?
            </a>
            <a href="#" className="text-sm text-primary p-2 rounded-md">
              Política de reembolsos
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
