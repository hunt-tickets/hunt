"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader2, CheckCircle2, XCircle, Settings } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface EditOrganizationFormProps {
  organization: Organization;
  currentUserRole: string;
}

export function EditOrganizationForm({
  organization,
  currentUserRole,
}: EditOrganizationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo || "",
  });

  // Check if user can edit (only owner)
  const canEdit = currentUserRole === "owner";

  // Track if there are any changes
  useEffect(() => {
    const changed =
      formData.name !== organization.name ||
      formData.slug !== organization.slug ||
      formData.logo !== (organization.logo || "");
    setHasChanges(changed);
  }, [formData, organization]);

  // Check slug availability (only if changed)
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug === organization.slug) {
      setSlugAvailable(true); // Original slug is always available
      return;
    }

    setIsCheckingSlug(true);
    try {
      const { data, error } = await authClient.organization.checkSlug({
        slug,
      });

      if (error) {
        console.error("Error checking slug:", error);
        setSlugAvailable(null);
        return;
      }

      setSlugAvailable(data?.status ?? null);
    } catch (error) {
      console.error("Error checking slug:", error);
      setSlugAvailable(null);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase();
    setFormData({ ...formData, slug });

    // Reset validation if slug is changed back to original
    if (slug === organization.slug) {
      setSlugAvailable(true);
    } else {
      setSlugAvailable(null);
    }
  };

  const handleSlugBlur = () => {
    if (formData.slug && formData.slug !== organization.slug) {
      checkSlugAvailability(formData.slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      toast.error("No tienes permisos para editar esta organización");
      return;
    }

    setIsLoading(true);

    try {
      // If slug changed, double-check availability
      if (formData.slug !== organization.slug && slugAvailable !== true) {
        await checkSlugAvailability(formData.slug);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Update the organization
      const { data, error } = await authClient.organization.update({
        data: {
          name: formData.name,
          slug: formData.slug,
          logo: formData.logo || undefined,
        },
        organizationId: organization.id,
      });

      if (error) {
        console.error("Error updating organization:", error);
        toast.error(error.message || "Error al actualizar la organización");
        return;
      }

      if (data) {
        toast.success("Organización actualizada exitosamente");
        router.refresh();
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Error al actualizar la organización");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo || "",
    });
    setSlugAvailable(null);
    setHasChanges(false);
  };

  if (!canEdit) {
    return (
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Settings className="h-12 w-12 text-white/40 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Permisos insuficientes
            </h3>
            <p className="text-sm text-white/60 max-w-md">
              Solo los propietarios pueden editar la configuración de la organización
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/90">
              Nombre de la organización{" "}
              <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Mi Organización"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
              className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-white/90">
              Identificador único (slug){" "}
              <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Input
                id="slug"
                type="text"
                placeholder="mi-organizacion"
                value={formData.slug}
                onChange={handleSlugChange}
                onBlur={handleSlugBlur}
                required
                disabled={isLoading}
                className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/40 pr-10"
              />
              {isCheckingSlug && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                </div>
              )}
              {!isCheckingSlug && slugAvailable === true && formData.slug !== organization.slug && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
              )}
              {!isCheckingSlug && slugAvailable === false && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XCircle className="h-4 w-4 text-red-400" />
                </div>
              )}
            </div>
            {slugAvailable === false && (
              <p className="text-xs text-red-400">
                Este slug ya está en uso. Por favor, elige otro.
              </p>
            )}
            {slugAvailable === true && formData.slug !== organization.slug && (
              <p className="text-xs text-green-400">¡Slug disponible!</p>
            )}
            <p className="text-xs text-white/40">
              Este será usado en URLs: hunt-tickets.com/org/{formData.slug || "..."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo" className="text-white/90">
              Logo (URL)
            </Label>
            <Input
              id="logo"
              type="url"
              placeholder="https://ejemplo.com/logo.png"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              disabled={isLoading}
              className="bg-white/[0.05] border-white/10 text-white placeholder:text-white/40"
            />
            {formData.logo && (
              <div className="mt-2">
                <p className="text-xs text-white/50 mb-2">Vista previa:</p>
                <img
                  src={formData.logo}
                  alt="Logo preview"
                  className="h-16 w-16 rounded-lg object-cover ring-2 ring-white/10"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {hasChanges && (
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  slugAvailable === false ||
                  !formData.name ||
                  !formData.slug
                }
                className="w-full sm:w-auto bg-white/90 hover:bg-white text-black"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
                className="w-full sm:w-auto border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Descartar cambios
              </Button>
            </div>
          )}

          {!hasChanges && (
            <p className="text-xs text-white/40 pt-4">
              No hay cambios pendientes
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
