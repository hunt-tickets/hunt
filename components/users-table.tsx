"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
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
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Cake,
  Search,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PAGINATION, DEBOUNCE_DELAYS } from "@/constants/constants";
import type { User } from "@/lib/users/types";
import {
  formatUserPhone,
  getUserInitials,
  getFullName,
  getUserAge,
  sanitizeForCSV,
} from "@/lib/users/utils";

// Lazy load UserProfileSheet - only needed when user clicks on a row
const UserProfileSheet = dynamic(
  () =>
    import("@/components/user-profile-sheet").then((mod) => ({
      default: mod.UserProfileSheet,
    })),
  { ssr: false }
);

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const lastExportTime = useRef<number>(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, DEBOUNCE_DELAYS.SEARCH);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Memoized filtered users - only recalculate when users or searchTerm changes
  const filteredUsers = useMemo(() => {
    if (searchTerm === "") return users;

    const search = searchTerm.toLowerCase();
    return users.filter((user) => {
      const fullName = [user.name, user.lastName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const email = (user.email || "").toLowerCase();
      const phone = (user.phone || "").toLowerCase();
      const document = (user.document_id || "").toLowerCase();

      return (
        fullName.includes(search) ||
        email.includes(search) ||
        phone.includes(search) ||
        document.includes(search)
      );
    });
  }, [users, searchTerm]);

  // Memoized pagination calculations
  const { totalPages, currentUsers } = useMemo(() => {
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    return { totalPages, currentUsers };
  }, [filteredUsers, currentPage, pageSize]);

  // Memoized callbacks to prevent recreation on every render
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handlePageSizeChange = useCallback((newSize: string) => {
    setPageSize(Number(newSize) as typeof pageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const hasActiveFilters = searchTerm !== "";

  // Export to Excel function with rate limiting and sanitization
  const handleExportToExcel = useCallback(() => {
    // Rate limiting: Prevent spam exports (max 1 per 10 seconds)
    const now = Date.now();
    if (now - lastExportTime.current < DEBOUNCE_DELAYS.EXPORT_RATE_LIMIT) {
      const remainingSeconds = Math.ceil(
        (DEBOUNCE_DELAYS.EXPORT_RATE_LIMIT - (now - lastExportTime.current)) /
          1000
      );
      alert(
        `Por favor espera ${remainingSeconds} segundos antes de exportar nuevamente.`
      );
      return;
    }
    lastExportTime.current = now;

    // Create CSV content with sanitized fields
    const headers = [
      "Nombre",
      "Apellido",
      "Email",
      "Teléfono",
      "Edad",
      "Género",
      "Documento",
      "Fecha Registro",
    ];
    const csvRows = [headers.join(",")];

    filteredUsers.forEach((user) => {
      const fullName = sanitizeForCSV(user.name);
      const lastName = sanitizeForCSV(user.lastName);
      const email = sanitizeForCSV(user.email);
      const phone = formatUserPhone(user.phone, user.prefix) || "";
      const age = user.birthdate
        ? String(getUserAge(user.birthdate) ?? "")
        : "";
      const gender = sanitizeForCSV(user.gender);
      const document = sanitizeForCSV(user.document_id);
      const createdAt = new Date(user.created_at).toLocaleDateString("es-CO");

      const row = [
        fullName,
        lastName,
        email,
        phone,
        age,
        gender,
        document,
        createdAt,
      ];
      csvRows.push(row.map((field) => `"${sanitizeForCSV(field)}"`).join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `usuarios_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // TODO: Show success toast instead of alert
    // toast.success(`Se exportaron ${filteredUsers.length} usuarios correctamente.`);
  }, [filteredUsers]);

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
            className="h-12 pl-12 pr-4 rounded-xl border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 focus:bg-gray-200 dark:focus:bg-white/10 transition-colors text-base placeholder:text-gray-600 dark:placeholder:text-white/50"
            aria-label="Buscar usuarios"
            aria-describedby="search-description"
          />
          <span id="search-description" className="sr-only">
            Busca usuarios por nombre, apellido, correo electrónico, teléfono o
            número de documento
          </span>
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Export Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportToExcel}
          className="h-12 px-4 rounded-xl bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black transition-colors gap-2"
          aria-label="Exportar usuarios a CSV"
        >
          <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-white/5">
              <TableHead className="font-medium text-gray-500 dark:text-white/50 py-3 text-xs uppercase tracking-wider">
                Usuario
              </TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">
                Correo
              </TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">
                Teléfono
              </TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">
                Edad
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-24">
                  <div className="text-center">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm text-gray-400 dark:text-white/40 mb-2">
                      No se encontraron usuarios
                    </p>
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
                const fullName = getFullName(user.name, user.lastName);
                const phoneNumber = formatUserPhone(user.phone, user.prefix);
                const initials = getUserInitials(user.name, user.lastName);

                const handleRowClick = () => {
                  setSelectedUser(user);
                  setIsProfileSheetOpen(true);
                };

                const handleKeyDown = (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick();
                  }
                };

                return (
                  <TableRow
                    key={user.id}
                    onClick={handleRowClick}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver perfil de ${fullName}`}
                    className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/30 transition-all duration-200 group cursor-pointer"
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
                        <span className="text-sm text-gray-400 dark:text-white/40">
                          -
                        </span>
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
                        <span className="text-sm text-gray-400 dark:text-white/40">
                          -
                        </span>
                      )}
                    </TableCell>

                    {/* Edad */}
                    <TableCell className="py-5">
                      {user.birthdate ? (
                        <span className="text-sm text-gray-700 dark:text-white/80 flex items-center gap-1.5">
                          <Cake className="h-3.5 w-3.5 text-gray-400 dark:text-white/50" />
                          {getUserAge(user.birthdate)} años
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-white/40">
                          -
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Ir a la página anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first page, last page, current page and neighbors
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, index, array) => {
                // Add ellipsis
                if (index > 0 && page - array[index - 1] > 1) {
                  return (
                    <div
                      key={`ellipsis-${page}`}
                      className="flex items-center gap-1"
                    >
                      <span className="text-gray-400 dark:text-white/30 px-1">
                        ·
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={`h-8 w-8 p-0 text-sm ${
                          currentPage === page
                            ? "bg-gray-900 dark:bg-white/10 text-white font-medium"
                            : "text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                        }`}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                }

                return (
                  <Button
                    key={page}
                    variant="ghost"
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={`h-8 w-8 p-0 text-sm ${
                      currentPage === page
                        ? "bg-gray-900 dark:bg-white/10 text-white font-medium"
                        : "text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Ir a la página siguiente"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Controlled User Profile Sheet */}
      {selectedUser && (
        <UserProfileSheet
          user={selectedUser}
          open={isProfileSheetOpen}
          onOpenChange={setIsProfileSheetOpen}
        />
      )}
    </div>
  );
}
