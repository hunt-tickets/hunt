"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Calendar,
  Image,
  Ticket,
  MapPin,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventSetupChecklistProps {
  eventName: string | null;
  hasDate: boolean;
  hasFlyer: boolean;
  hasTicketTypes: boolean;
  hasLocation: boolean;
  configUrl: string;
  ticketsUrl: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  href: string;
  required: boolean;
}

export function EventSetupChecklist({
  eventName,
  hasDate,
  hasFlyer,
  hasTicketTypes,
  hasLocation,
  configUrl,
  ticketsUrl,
}: EventSetupChecklistProps) {
  const items: ChecklistItem[] = [
    {
      id: "date",
      label: "Fecha y hora",
      description: "Define cuándo será tu evento",
      completed: hasDate,
      icon: <Calendar className="h-4 w-4" />,
      href: configUrl,
      required: true,
    },
    {
      id: "flyer",
      label: "Flyer del evento",
      description: "Sube la imagen principal",
      completed: hasFlyer,
      icon: <Image className="h-4 w-4" />,
      href: configUrl,
      required: false,
    },
    {
      id: "tickets",
      label: "Tipos de entrada",
      description: "Crea al menos una entrada",
      completed: hasTicketTypes,
      icon: <Ticket className="h-4 w-4" />,
      href: ticketsUrl,
      required: true,
    },
    {
      id: "location",
      label: "Ubicación",
      description: "Indica dónde será el evento",
      completed: hasLocation,
      icon: <MapPin className="h-4 w-4" />,
      href: configUrl,
      required: false,
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const requiredItems = items.filter((item) => item.required);
  const requiredComplete = requiredItems.every((item) => item.completed);
  const allComplete = completedCount === items.length;

  if (allComplete) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Configura tu evento</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{items.length} completados
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {eventName ? `"${eventName}"` : "Tu evento"} necesita algunos detalles
          antes de poder publicarse.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
              item.completed
                ? "bg-green-500/10 hover:bg-green-500/15"
                : "bg-background/50 hover:bg-background/80"
            )}
          >
            {/* Status icon */}
            {item.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}

            {/* Icon */}
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                item.completed
                  ? "bg-green-500/20 text-green-500"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-medium",
                    item.completed && "text-green-500"
                  )}
                >
                  {item.label}
                </span>
                {item.required && !item.completed && (
                  <span className="text-xs text-destructive">Requerido</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            </div>

            {/* Arrow */}
            {!item.completed && (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </Link>
        ))}

        {/* Publish hint */}
        {!requiredComplete && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Completa los campos requeridos para poder publicar tu evento
          </p>
        )}
      </CardContent>
    </Card>
  );
}
