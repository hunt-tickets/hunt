"use client";

import { useState } from "react";
import { Mail, Edit2, Trash2 } from "lucide-react";
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

  const handleEdit = () => {
    setMenuOpen(false);
    // Aquí puedes agregar la lógica para editar el email
    console.log("Edit email");
  };

  const handleDelete = () => {
    setMenuOpen(false);
    // Aquí puedes agregar la lógica para eliminar el email
    console.log("Delete email");
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <Mail className="h-5 w-5 text-gray-400" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{email}</span>
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
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
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-[#2a2a2a] invisible group-hover:visible transition-all rounded-lg h-8 w-8 flex items-center justify-center"
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
              onClick={handleEdit}
              className="rounded-xl cursor-pointer flex items-center px-3 py-2"
            >
              <Edit2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="rounded-xl cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 px-3 py-2"
            >
              <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
