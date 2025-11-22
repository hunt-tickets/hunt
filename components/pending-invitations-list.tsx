"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Mail, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  inviterId: string;
}

interface PendingInvitationsListProps {
  invitations: Invitation[];
  currentUserRole: string;
}

export function PendingInvitationsList({
  invitations,
  currentUserRole,
}: PendingInvitationsListProps) {
  const router = useRouter();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filter only pending invitations
  const pendingInvitations = invitations.filter((inv) => inv.status === "pending");

  // Format role for display
  const formatRole = (role: string) => {
    const roleMap: { [key: string]: string } = {
      owner: "Propietario",
      administrator: "Administrador",
      seller: "Vendedor",
      member: "Miembro",
    };
    return roleMap[role] || role;
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if invitation is expired
  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date();
  };

  // Check if user can cancel invitations (owner or administrator)
  const canCancel = currentUserRole === "owner" || currentUserRole === "administrator";

  const handleCancelInvitation = async (invitationId: string) => {
    setCancellingId(invitationId);
    try {
      await authClient.organization.cancelInvitation({
        invitationId,
      });
      router.refresh();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      alert("Error al cancelar la invitación");
    } finally {
      setCancellingId(null);
    }
  };

  if (pendingInvitations.length === 0) {
    return (
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="h-12 w-12 text-white/40 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No hay invitaciones pendientes
            </h3>
            <p className="text-sm text-white/60 max-w-md">
              Todas las invitaciones han sido aceptadas o canceladas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-white/50">Pendientes</p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {pendingInvitations.length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-white/50">Por expirar</p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {pendingInvitations.filter((inv) => {
                  const daysUntilExpiry = Math.ceil(
                    (new Date(inv.expiresAt).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return daysUntilExpiry <= 2 && daysUntilExpiry > 0;
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-white/50">Expiradas</p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {pendingInvitations.filter((inv) => isExpired(inv.expiresAt)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {pendingInvitations.map((invitation) => {
          const expired = isExpired(invitation.expiresAt);
          return (
            <Card key={invitation.id} className="bg-white/[0.02] border-white/10">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
                        <Mail className="h-5 w-5 text-white/60" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">
                          {invitation.email}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-white/40 flex-shrink-0" />
                          <span className="text-xs text-white/60">
                            Expira: {formatDate(invitation.expiresAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={
                        expired
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }
                    >
                      {expired ? "Expirada" : formatRole(invitation.role)}
                    </Badge>

                    {canCancel && !expired && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            disabled={cancellingId === invitation.id}
                          >
                            Cancelar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Cancelar invitación?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Se cancelará la invitación enviada a{" "}
                              <strong>{invitation.email}</strong>. Esta acción no se
                              puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Volver</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Cancelar invitación
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-white/5">
                <TableHead className="font-medium text-white/50 py-3 pl-6 text-xs uppercase tracking-wider">
                  Email
                </TableHead>
                <TableHead className="font-medium text-white/50 text-xs uppercase tracking-wider">
                  Rol
                </TableHead>
                <TableHead className="font-medium text-white/50 text-xs uppercase tracking-wider">
                  Expira
                </TableHead>
                <TableHead className="font-medium text-white/50 text-xs uppercase tracking-wider">
                  Estado
                </TableHead>
                {canCancel && (
                  <TableHead className="font-medium text-white/50 text-xs uppercase tracking-wider text-center pr-6">
                    Acciones
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvitations.map((invitation) => {
                const expired = isExpired(invitation.expiresAt);
                return (
                  <TableRow
                    key={invitation.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-all duration-200"
                  >
                    <TableCell className="py-5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
                          <Mail className="h-5 w-5 text-white/60" />
                        </div>
                        <span className="font-medium text-white">
                          {invitation.email}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-5">
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-400 border-blue-500/20"
                      >
                        {formatRole(invitation.role)}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-white/40" />
                        <span className="text-sm text-white/70">
                          {formatDate(invitation.expiresAt)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-5">
                      <Badge
                        variant="outline"
                        className={
                          expired
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }
                      >
                        {expired ? "Expirada" : "Pendiente"}
                      </Badge>
                    </TableCell>

                    {canCancel && (
                      <TableCell className="text-center py-5 pr-6">
                        {!expired && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                disabled={cancellingId === invitation.id}
                              >
                                {cancellingId === invitation.id
                                  ? "Cancelando..."
                                  : "Cancelar"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Cancelar invitación?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se cancelará la invitación enviada a{" "}
                                  <strong>{invitation.email}</strong>. Esta acción
                                  no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Volver</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleCancelInvitation(invitation.id)
                                  }
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Cancelar invitación
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
