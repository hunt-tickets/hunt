"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Link as LinkIcon,
  Plus,
  Copy,
  Trash2,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EventLinksContentProps {
  eventId: string;
}

interface SalesLink {
  id: string;
  name: string;
  url: string;
  clicks: number;
  conversions: number;
  revenue: number;
  isActive: boolean;
  createdAt: string;
}

export function EventLinksContent({ eventId }: EventLinksContentProps) {
  const [links, setLinks] = useState<SalesLink[]>([
    {
      id: "1",
      name: "Link Principal",
      url: `https://hunt.tickets/event/${eventId}?ref=main`,
      clicks: 245,
      conversions: 32,
      revenue: 1280000,
      isActive: true,
      createdAt: "2024-11-01",
    },
    {
      id: "2",
      name: "Instagram Story",
      url: `https://hunt.tickets/event/${eventId}?ref=ig-story`,
      clicks: 189,
      conversions: 18,
      revenue: 720000,
      isActive: true,
      createdAt: "2024-11-05",
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkRef, setNewLinkRef] = useState("");

  const handleCopyLink = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`Link "${name}" copiado al portapapeles`);
  };

  const handleCreateLink = () => {
    if (!newLinkName.trim() || !newLinkRef.trim()) return;

    const newLink: SalesLink = {
      id: Date.now().toString(),
      name: newLinkName,
      url: `https://hunt.tickets/event/${eventId}?ref=${newLinkRef}`,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setLinks([...links, newLink]);
    setNewLinkName("");
    setNewLinkRef("");
    setIsCreating(false);
    toast.success("Link creado exitosamente");
  };

  const handleDeleteLink = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el link "${name}"?`)) {
      setLinks(links.filter(link => link.id !== id));
      toast.success("Link eliminado");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateConversionRate = (clicks: number, conversions: number) => {
    if (clicks === 0) return "0%";
    return `${((conversions / clicks) * 100).toFixed(1)}%`;
  };

  // Calculate totals
  const totals = links.reduce(
    (acc, link) => ({
      clicks: acc.clicks + link.clicks,
      conversions: acc.conversions + link.conversions,
      revenue: acc.revenue + link.revenue,
    }),
    { clicks: 0, conversions: 0, revenue: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <BarChart3 className="h-4 w-4 text-white/40" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.clicks}</div>
            <p className="text-xs text-white/40">En todos los links</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
            <TrendingUp className="h-4 w-4 text-white/40" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.conversions}</div>
            <p className="text-xs text-white/40">
              {calculateConversionRate(totals.clicks, totals.conversions)} tasa de conversión
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <LinkIcon className="h-4 w-4 text-white/40" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.revenue)}</div>
            <p className="text-xs text-white/40">Total generado</p>
          </CardContent>
        </Card>
      </div>

      {/* Links List */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Links de Venta</CardTitle>
              <CardDescription>
                Gestiona y rastrea tus links de venta
              </CardDescription>
            </div>
            {!isCreating && (
              <Button
                onClick={() => setIsCreating(true)}
                className="rounded-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Link
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Link Form */}
          {isCreating && (
            <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                  Crear Nuevo Link
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link-name" className="text-sm font-medium">
                    Nombre del Link
                  </Label>
                  <Input
                    id="link-name"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    placeholder="ej. Facebook Post"
                    className="rounded-lg bg-white/5 border-white/10 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-ref" className="text-sm font-medium">
                    Código de Referencia
                  </Label>
                  <Input
                    id="link-ref"
                    value={newLinkRef}
                    onChange={(e) => setNewLinkRef(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="ej. fb-post"
                    className="rounded-lg bg-white/5 border-white/10 h-11"
                  />
                </div>
              </div>

              {newLinkRef && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/40 mb-1">URL generada:</p>
                  <p className="text-sm text-white/80 font-mono break-all">
                    https://hunt.tickets/event/{eventId}?ref={newLinkRef}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewLinkName("");
                    setNewLinkRef("");
                  }}
                  className="rounded-lg border-white/10 hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateLink}
                  className="rounded-lg bg-white text-black hover:bg-white/90"
                  disabled={!newLinkName.trim() || !newLinkRef.trim()}
                >
                  Crear Link
                </Button>
              </div>
            </div>
          )}

          {/* Links Grid */}
          {links.length === 0 ? (
            <div className="text-center py-12">
              <LinkIcon className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1 text-white">
                No hay links de venta
              </h3>
              <p className="text-sm text-white/40 mb-6">
                Crea tu primer link para comenzar a rastrear ventas
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                variant="outline"
                className="rounded-full border-white/10 hover:bg-white/5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Link
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white text-base">
                            {link.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/60 font-mono">
                          <span className="truncate">{link.url}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(link.url, link.name)}
                          className="h-9 w-9 p-0 rounded-lg hover:bg-white/10"
                          title="Copiar link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLink(link.id, link.name)}
                          className="h-9 w-9 p-0 rounded-lg hover:bg-red-500/20 hover:text-red-400"
                          title="Eliminar link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 pt-3 border-t border-white/10">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Clicks</p>
                        <p className="text-lg font-semibold text-white">{link.clicks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Conversiones</p>
                        <p className="text-lg font-semibold text-white">{link.conversions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Tasa Conversión</p>
                        <p className="text-lg font-semibold text-white">
                          {calculateConversionRate(link.clicks, link.conversions)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Ingresos</p>
                        <p className="text-lg font-semibold text-white">
                          {formatCurrency(link.revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
