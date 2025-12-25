"use client";

import Link from "next/link";
import {
  Check,
  Calendar,
  Image,
  Ticket,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventSetupChecklistProps {
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
  completed: boolean;
  icon: React.ReactNode;
  href: string;
  required: boolean;
}

export function EventSetupChecklist({
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
      completed: hasDate,
      icon: <Calendar className="h-4 w-4" />,
      href: configUrl,
      required: true,
    },
    {
      id: "tickets",
      label: "Entradas",
      completed: hasTicketTypes,
      icon: <Ticket className="h-4 w-4" />,
      href: ticketsUrl,
      required: true,
    },
    {
      id: "flyer",
      label: "Flyer",
      completed: hasFlyer,
      icon: <Image className="h-4 w-4" />,
      href: configUrl,
      required: false,
    },
    {
      id: "location",
      label: "Ubicación",
      completed: hasLocation,
      icon: <MapPin className="h-4 w-4" />,
      href: configUrl,
      required: false,
    },
  ];

  const allComplete = items.every((item) => item.completed);

  if (allComplete) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all",
            "border",
            item.completed
              ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
              : "bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/50"
          )}
        >
          {item.completed ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            item.icon
          )}
          <span className="font-medium">{item.label}</span>
          {item.required && !item.completed && (
            <span className="text-xs text-red-500 dark:text-red-400">*</span>
          )}
          {!item.completed && (
            <ArrowRight className="h-3.5 w-3.5 opacity-50" />
          )}
        </Link>
      ))}
    </div>
  );
}
