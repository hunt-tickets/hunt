"use client";

import { useState } from "react";
import { Mail, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmailManagerProps {
  email: string;
}

export function EmailManager({ email }: EmailManagerProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAddEmail = () => {
    setMenuOpen(false);
    // Aquí puedes agregar la lógica para agregar un correo adicional
    console.log("Add email");
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{email}</span>
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20 flex-shrink-0"
            >
              Principal
            </Badge>
          </div>
        </div>
      </div>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-[#2a2a2a] invisible group-hover:visible transition-all rounded-lg h-8 w-8 flex items-center justify-center flex-shrink-0"
          >
            <span className="text-xl">⋯</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 rounded-2xl border dark:border-zinc-800 bg-background/95 backdrop-blur-md shadow-lg"
          sideOffset={8}
        >
          <div className="p-1">
            <DropdownMenuItem
              onClick={handleAddEmail}
              className="rounded-xl cursor-pointer flex items-center px-3 py-2"
            >
              <Plus className="mr-2 h-4 w-4" strokeWidth={1.5} />
              <span>Agregar correo</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
