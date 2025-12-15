"use client";

import { MoreVertical, FileEdit, Trash2, Copy, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EventOptionsMenuProps {
  eventId: string;
  eventName: string;
}

export function EventOptionsMenu({ eventId, eventName }: EventOptionsMenuProps) {
  const handleEdit = () => {
    // TODO: Navigate to edit event page or open edit modal
    console.log("Edit event", eventId);
  };

  const handleDuplicate = () => {
    // TODO: Duplicate event
    console.log("Duplicate event", eventId);
  };

  const handleArchive = () => {
    // TODO: Archive event
    console.log("Archive event", eventId);
  };

  const handleDelete = () => {
    // TODO: Show confirmation dialog and delete event
    console.log("Delete event", eventId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800"
          aria-label="Opciones del evento"
        >
          <MoreVertical className="h-5 w-5 text-zinc-900 dark:text-white" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleEdit}>
          <FileEdit className="mr-2 h-4 w-4" />
          <span>Editar evento</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicar</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleArchive}>
          <Archive className="mr-2 h-4 w-4" />
          <span>Archivar</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Eliminar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
