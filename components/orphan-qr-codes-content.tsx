"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface OrphanQR {
  id: string;
  transaction_id: string;
  user_id: string;
  svg: string;
  created_at: string;
  scan: boolean;
  scanner_id: string | null;
  updated_at: string | null;
  apple: string | null;
  google: string | null;
  user_name: string;
  user_email: string;
}

interface OrphanQRCodesContentProps {
  orphanQRs: OrphanQR[];
}

export function OrphanQRCodesContent({ orphanQRs }: OrphanQRCodesContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQR, setSelectedQR] = useState<OrphanQR | null>(null);
  const itemsPerPage = 50;

  // Filter QRs based on search
  const filteredQRs = useMemo(() => {
    if (!searchTerm) return orphanQRs;

    const search = searchTerm.toLowerCase();
    return orphanQRs.filter(qr =>
      qr.transaction_id.toLowerCase().includes(search) ||
      qr.user_name.toLowerCase().includes(search) ||
      qr.user_email.toLowerCase().includes(search) ||
      qr.id.toLowerCase().includes(search)
    );
  }, [orphanQRs, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredQRs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQRs = filteredQRs.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Search and Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            type="text"
            placeholder="Buscar por ID, transacción, usuario, email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
        <div className="text-sm text-white/60">
          {filteredQRs.length} QR{filteredQRs.length !== 1 ? 's' : ''} huérfano{filteredQRs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <div className="text-xs text-white/40 mb-1">Total QR Huérfanos</div>
          <div className="text-2xl font-bold text-red-400">{filteredQRs.length}</div>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
          <div className="text-xs text-white/40 mb-1">Escaneados</div>
          <div className="text-2xl font-bold">{filteredQRs.filter(qr => qr.scan).length}</div>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
          <div className="text-xs text-white/40 mb-1">No Escaneados</div>
          <div className="text-2xl font-bold">{filteredQRs.filter(qr => !qr.scan).length}</div>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
          <div className="text-xs text-white/40 mb-1">Con Wallet</div>
          <div className="text-2xl font-bold">{filteredQRs.filter(qr => qr.apple || qr.google).length}</div>
        </div>
      </div>

      {/* QR Codes Table */}
      {currentQRs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              {searchTerm ? "No se encontraron QR codes" : "No hay QR codes huérfanos"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Intenta con otro término de búsqueda" : "Todos los QR codes tienen transacciones asociadas"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-white/[0.02] border-white/5">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Fecha Creación</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">ID Transacción</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Usuario</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wider">Escaneado</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wider">Apple</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wider">Google</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Última Actualización</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentQRs.map((qr) => (
                      <tr
                        key={qr.id}
                        onClick={() => setSelectedQR(qr)}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-sm">
                          <div className="text-white/90">
                            {new Date(qr.created_at).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-white/40">
                            {new Date(qr.created_at).toLocaleTimeString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-white/90 font-mono text-xs max-w-[150px] truncate" title={qr.transaction_id}>
                            {qr.transaction_id}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-white/90">
                            {qr.user_name}
                          </div>
                          <div className="text-xs text-white/40 truncate max-w-[200px]" title={qr.user_email}>
                            {qr.user_email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            qr.scan
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {qr.scan ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            qr.apple
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {qr.apple ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            qr.google
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {qr.google ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/90">
                          {qr.updated_at ? (
                            <div>
                              <div>
                                {new Date(qr.updated_at).toLocaleDateString('es-CO', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-white/40">
                                {new Date(qr.updated_at).toLocaleTimeString('es-CO', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-white/40">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredQRs.length)} de {filteredQRs.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm px-4 py-2 rounded-lg bg-white/5">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* QR Detail Sidebar */}
      {selectedQR && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSelectedQR(null)}
          />

          {/* Sidebar Panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[700px] bg-[#1a1a1a] border-l border-white/10 z-50 overflow-y-auto">
            <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Detalle de QR Huérfano</h2>
              <button
                onClick={() => setSelectedQR(null)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* QR Code Display */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                    <h3 className="text-sm font-semibold text-white/90">QR Code Huérfano</h3>
                  </div>
                  <div
                    className="bg-white p-4 rounded-lg shadow-lg"
                    dangerouslySetInnerHTML={{ __html: selectedQR.svg }}
                  />
                  <p className="text-xs text-white/40 font-mono break-all text-center">{selectedQR.id}</p>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="text-xs text-white/40 mb-1">Escaneado</div>
                  <div className={`text-lg font-bold ${selectedQR.scan ? 'text-green-400' : 'text-gray-400'}`}>
                    {selectedQR.scan ? 'Sí' : 'No'}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="text-xs text-white/40 mb-1">En Wallet</div>
                  <div className="text-lg font-bold text-white/90">
                    {selectedQR.apple || selectedQR.google ? 'Sí' : 'No'}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                <h3 className="text-sm font-semibold text-white/60 mb-3">Usuario Propietario</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/40 mb-1">Nombre</div>
                    <div className="text-sm font-medium text-white/90">{selectedQR.user_name}</div>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div>
                    <div className="text-xs text-white/40 mb-1">Correo Electrónico</div>
                    <div className="text-sm font-medium text-white/90 break-all">{selectedQR.user_email}</div>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div>
                    <div className="text-xs text-white/40 mb-1">ID de Usuario</div>
                    <div className="text-xs font-mono text-white/60 break-all">{selectedQR.user_id}</div>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <h3 className="text-sm font-semibold text-red-400 mb-3">Información de Transacción</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/40 mb-1">ID de Transacción</div>
                    <div className="text-xs font-mono text-white/90 break-all">{selectedQR.transaction_id}</div>
                  </div>
                  <div className="h-px bg-red-500/20" />
                  <div className="text-xs text-red-400">
                    ⚠️ Esta transacción no existe en ninguna de las tablas de transacciones
                  </div>
                </div>
              </div>

              {/* Wallet Info */}
              {(selectedQR.apple || selectedQR.google) && (
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                  <h3 className="text-sm font-semibold text-white/60 mb-3">Información de Wallet</h3>
                  <div className="space-y-3">
                    {selectedQR.apple && (
                      <div>
                        <div className="text-xs text-white/40 mb-1">Apple Wallet</div>
                        <div className="text-xs font-mono text-blue-400 break-all">{selectedQR.apple}</div>
                      </div>
                    )}
                    {selectedQR.google && (
                      <>
                        {selectedQR.apple && <div className="h-px bg-white/5" />}
                        <div>
                          <div className="text-xs text-white/40 mb-1">Google Wallet</div>
                          <div className="text-xs font-mono text-green-400 break-all">{selectedQR.google}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Scanner Info */}
              {selectedQR.scanner_id && (
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                  <h3 className="text-sm font-semibold text-white/60 mb-3">Información de Escaneo</h3>
                  <div>
                    <div className="text-xs text-white/40 mb-1">ID del Escáner</div>
                    <div className="text-xs font-mono text-white/60 break-all">{selectedQR.scanner_id}</div>
                  </div>
                </div>
              )}

              {/* Dates Info */}
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                <h3 className="text-sm font-semibold text-white/60 mb-3">Fechas</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/40 mb-1">Creado</div>
                    <div className="text-sm font-medium text-white/90">
                      {new Date(selectedQR.created_at).toLocaleString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {selectedQR.updated_at && (
                    <>
                      <div className="h-px bg-white/5" />
                      <div>
                        <div className="text-xs text-white/40 mb-1">Última Actualización</div>
                        <div className="text-sm font-medium text-white/90">
                          {new Date(selectedQR.updated_at).toLocaleString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
