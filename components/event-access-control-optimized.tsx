"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QrCode,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Smartphone,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Apple,
} from "lucide-react";
import {
  getEventAccessStats,
  getEventQRCodesPaginated,
  type AccessControlStats,
  type QRCodePaginated,
} from "@/lib/supabase/actions/access-control-optimized";
import { toast } from "sonner";

interface EventAccessControlOptimizedProps {
  eventId: string;
  initialStats?: AccessControlStats | null;
}

export function EventAccessControlOptimized({
  eventId,
  initialStats,
}: EventAccessControlOptimizedProps) {
  // Estado principal
  const [stats, setStats] = useState<AccessControlStats | null>(initialStats || null);
  const [loadingStats, setLoadingStats] = useState(!initialStats);

  // Estado para QR codes
  const [qrCodes, setQrCodes] = useState<QRCodePaginated[]>([]);
  const [loadingQR, setLoadingQR] = useState(false);
  const [totalQR, setTotalQR] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState<'all' | 'app' | 'web' | 'cash'>('all');
  const [filterScanned, setFilterScanned] = useState<'all' | 'scanned' | 'unscanned'>('all');
  const [activeTab, setActiveTab] = useState<'analytics' | 'qrcodes' | 'missing'>('analytics');

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await getEventAccessStats(eventId);
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Error al cargar estadísticas");
    } finally {
      setLoadingStats(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!initialStats) {
      loadStats();
    }
  }, [initialStats, loadStats]);

  // Cargar QR codes cuando se cambia a esa tab
  const loadQRCodes = useCallback(async () => {
    setLoadingQR(true);
    try {
      const response = await getEventQRCodesPaginated(
        eventId,
        currentPage,
        pageSize,
        searchTerm || undefined,
        filterScanned === 'scanned' ? true : filterScanned === 'unscanned' ? false : undefined,
        filterSource === 'all' ? undefined : filterSource
      );

      setQrCodes(response.data);
      setTotalQR(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error loading QR codes:", error);
      toast.error("Error al cargar códigos QR");
    } finally {
      setLoadingQR(false);
    }
  }, [eventId, currentPage, pageSize, searchTerm, filterScanned, filterSource]);

  useEffect(() => {
    if (activeTab === 'qrcodes') {
      loadQRCodes();
    }
  }, [activeTab, loadQRCodes]);

  // Funciones de utilidad
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterSource = useCallback((value: 'all' | 'app' | 'web' | 'cash') => {
    setFilterSource(value);
    setCurrentPage(1);
  }, []);

  const handleFilterScanned = useCallback((value: 'all' | 'scanned' | 'unscanned') => {
    setFilterScanned(value);
    setCurrentPage(1);
  }, []);

  const exportToCSV = () => {
    // TODO: Implementar exportación
    toast.info("Exportación en desarrollo");
  };

  // Renderizado de estadísticas
  const renderStats = () => {
    if (loadingStats) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </div>
      );
    }

    const scanRate = stats.actualQRs > 0 ? (stats.scannedQRs / stats.actualQRs * 100).toFixed(1) : '0';
    const coverageRate = stats.expectedQRs > 0 ? (stats.actualQRs / stats.expectedQRs * 100).toFixed(1) : '0';

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expectedQRs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalTransactions.toLocaleString()} transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              QR Generados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.actualQRs.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${coverageRate}%` }}
                />
              </div>
              <span className="text-xs font-medium">{coverageRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Escaneados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scannedQRs.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-secondary rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${scanRate}%` }}
                />
              </div>
              <span className="text-xs font-medium">{scanRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Apple className="h-4 w-4" />
                <span className="text-lg font-semibold">
                  {stats.appleWallet.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-4 w-4" />
                <span className="text-lg font-semibold">
                  {stats.googleWallet.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Agregados a wallet
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderizado de tabla de QR codes
  const renderQRTable = () => {
    if (loadingQR) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (qrCodes.length === 0) {
      return (
        <div className="text-center py-12">
          <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron códigos QR</p>
        </div>
      );
    }

    return (
      <>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell className="font-mono text-xs">
                    {qr.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{qr.user_name}</div>
                      <div className="text-xs text-muted-foreground">{qr.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{qr.ticket_name}</TableCell>
                  <TableCell>
                    <Badge variant={qr.source === 'app' ? 'default' : qr.source === 'web' ? 'secondary' : 'outline'}>
                      {qr.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {qr.scan ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs">Escaneado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        <span className="text-xs">Sin escanear</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {qr.apple && <Apple className="h-4 w-4" />}
                      {qr.google && <Smartphone className="h-4 w-4" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatDate(qr.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * pageSize) + 1} a{' '}
            {Math.min(currentPage * pageSize, totalQR)} de {totalQR} registros
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controles principales */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email o nombre..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Select value={filterSource} onValueChange={handleFilterSource}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="app">App</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="cash">Efectivo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterScanned} onValueChange={handleFilterScanned}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="scanned">Escaneados</SelectItem>
              <SelectItem value="unscanned">Sin escanear</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="qrcodes">
            Códigos QR {stats && <span className="ml-1">({stats.actualQRs})</span>}
          </TabsTrigger>
          <TabsTrigger value="missing">
            QR Faltantes {stats && stats.missingQRs > 0 && (
              <Badge variant="destructive" className="ml-1">{stats.missingQRs}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          {renderStats()}
        </TabsContent>

        <TabsContent value="qrcodes" className="space-y-4">
          {renderQRTable()}
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Función en desarrollo - Mostrará transacciones sin QR generados
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}