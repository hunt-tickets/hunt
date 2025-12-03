"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Phone, Mail, Cake, Search, X } from "lucide-react";
import { EditUserSheet } from "@/components/edit-user-sheet";
import { UserProfileSheet } from "@/components/user-profile-sheet";
import { Input } from "@/components/ui/input";

// Calculate age from birthdate
function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

interface User {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  birthdate: string | null;
  gender: string | null;
  prefix: string | null;
  document_id: string | null;
  admin: boolean;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Filter users based on search only
  const filteredUsers = users.filter((user) => {
    const fullName = [user.name, user.lastName].filter(Boolean).join(' ').toLowerCase();
    const email = (user.email || "").toLowerCase();
    const phone = (user.phone || "").toLowerCase();
    const document = (user.document_id || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    // Search filter
    return searchTerm === "" ||
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      document.includes(search);
  });

  // Calculate pagination based on filtered users
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const hasActiveFilters = searchTerm !== "";

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-white/50" />
          <Input
            type="text"
            placeholder="Buscar por nombre, email, teléfono o documento..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-12 pl-12 pr-4 rounded-xl border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 focus:bg-gray-200 dark:focus:bg-white/10 transition-colors text-base placeholder:text-gray-500 dark:placeholder:text-white/50"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500 dark:text-white/50 whitespace-nowrap">
          {filteredUsers.length === users.length ? (
            <span>{users.length} usuarios</span>
          ) : (
            <span>
              {filteredUsers.length} de {users.length}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-white/5">
              <TableHead className="font-medium text-gray-500 dark:text-white/50 py-3 text-xs uppercase tracking-wider">Usuario</TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">Correo</TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">Teléfono</TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">Edad</TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {currentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-24">
                    <div className="text-center">
                      <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm text-gray-400 dark:text-white/40 mb-2">No se encontraron usuarios</p>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchInput("")}
                          className="text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10"
                        >
                          Limpiar búsqueda
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user) => {
                const fullName = [user.name, user.lastName]
                  .filter(Boolean)
                  .join(' ') || 'Sin nombre';

                // Prefix is for phone, not document
                const phoneNumber = user.phone
                  ? user.prefix
                    ? `${user.prefix} ${user.phone}`
                    : user.phone
                  : null;

                const initials = fullName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <TableRow
                    key={user.id}
                    className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-200 group"
                  >
                    {/* Usuario */}
                    <TableCell className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0 font-semibold text-sm text-gray-900 dark:text-white/90 ring-1 ring-gray-200 dark:ring-white/10">
                          {initials}
                        </div>
                        <span className="font-medium truncate">{fullName}</span>
                      </div>
                    </TableCell>

                    {/* Correo */}
                    <TableCell className="py-5">
                      {user.email ? (
                        <span className="text-sm text-gray-700 dark:text-white/80 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-gray-400 dark:text-white/50" />
                          {user.email}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-white/40">-</span>
                      )}
                    </TableCell>

                    {/* Teléfono */}
                    <TableCell className="py-5">
                      {phoneNumber ? (
                        <span className="text-sm text-gray-700 dark:text-white/80 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-white/50" />
                          {phoneNumber}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-white/40">-</span>
                      )}
                    </TableCell>

                    {/* Edad */}
                    <TableCell className="py-5">
                      {user.birthdate ? (
                        <span className="text-sm text-gray-700 dark:text-white/80 flex items-center gap-1.5">
                          <Cake className="h-3.5 w-3.5 text-gray-400 dark:text-white/50" />
                          {calculateAge(user.birthdate)} años
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-white/40">-</span>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right py-5">
                      <div className="flex items-center justify-end gap-2">
                        <UserProfileSheet user={user} />
                        <EditUserSheet user={user} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
              )}
            </TableBody>
          </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3 text-sm pt-4">
          <span className="text-gray-500 dark:text-white/40">Mostrar</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-9 w-[70px] rounded-lg border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-100 dark:hover:bg-white/[0.02] transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-gray-200 dark:border-white/10">
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-gray-500 dark:text-white/40">
            de <span className="text-gray-700 dark:text-white/70 font-medium">{filteredUsers.length}</span> usuarios
          </span>
        </div>

        <div className="flex items-center gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 px-3 hover:bg-gray-100 dark:hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <span className="text-sm text-gray-500 dark:text-white/50 px-3">
            Página <span className="text-foreground font-medium">{currentPage}</span> de <span className="text-gray-700 dark:text-white/70">{totalPages}</span>
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-9 px-3 hover:bg-gray-100 dark:hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
