"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader2, CheckCircle2, XCircle, Settings, Building2, KeyRound, Upload, FileText, User, Building, Phone, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { ImageCropDialog } from "@/components/image-crop-dialog";

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
    brebKey: "", // Empty for now, will be connected to backend later
    // Public contact information
    publicPhone: "",
    publicEmail: "",
    // Billing data
    personType: "natural" as "natural" | "juridica",
    // Natural person fields
    fullName: "",
    documentType: "",
    documentNumber: "",
    address: "",
    email: "",
    rut: "",
    // Legal entity fields
    legalName: "",
    nit: "",
    nitVerification: "",
    legalAddress: "",
    legalEmail: "",
    legalRut: "",
    cerl: "",
  });
  const [logoPreview, setLogoPreview] = useState<string>(organization.logo || "");
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>("");

  // Check if user can edit (only owner)
  const canEdit = currentUserRole === "owner";

  // Track if there are any changes
  useEffect(() => {
    const changed =
      formData.name !== organization.name ||
      formData.slug !== organization.slug ||
      formData.logo !== (organization.logo || "") ||
      formData.brebKey !== "" ||
      // Public contact changes
      formData.publicPhone !== "" ||
      formData.publicEmail !== "" ||
      // Billing data changes
      formData.fullName !== "" ||
      formData.documentType !== "" ||
      formData.documentNumber !== "" ||
      formData.address !== "" ||
      formData.email !== "" ||
      formData.rut !== "" ||
      formData.legalName !== "" ||
      formData.nit !== "" ||
      formData.nitVerification !== "" ||
      formData.legalAddress !== "" ||
      formData.legalEmail !== "" ||
      formData.legalRut !== "" ||
      formData.cerl !== "";
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecciona un archivo de imagen válido");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen debe ser menor a 5MB");
        return;
      }

      // Create preview and open crop dialog
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setTempImageSrc(result);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }

    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleCropComplete = (croppedImage: string) => {
    setLogoPreview(croppedImage);
    setFormData({ ...formData, logo: croppedImage });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF)
      if (file.type !== "application/pdf") {
        toast.error("Por favor, selecciona un archivo PDF válido");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo debe ser menor a 5MB");
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData({ ...formData, [fieldName]: result });
      };
      reader.readAsDataURL(file);
    }

    // Reset input so the same file can be selected again
    e.target.value = "";
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
      brebKey: "", // Reset to empty
      // Public contact information
      publicPhone: "",
      publicEmail: "",
      // Billing data
      personType: "natural" as "natural" | "juridica",
      fullName: "",
      documentType: "",
      documentNumber: "",
      address: "",
      email: "",
      rut: "",
      legalName: "",
      nit: "",
      nitVerification: "",
      legalAddress: "",
      legalEmail: "",
      legalRut: "",
      cerl: "",
    });
    setLogoPreview(organization.logo || "");
    setSlugAvailable(null);
    setHasChanges(false);
  };

  if (!canEdit) {
    return (
      <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 dark:text-white/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Permisos insuficientes
            </h3>
            <p className="text-sm text-gray-600 dark:text-white/60 max-w-md">
              Solo los propietarios pueden editar la configuración de la organización
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Text Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre de la organización{" "}
                  <span className="text-red-400">*</span>
                </Label>
                <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      placeholder="Mi Organización"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isLoading}
                      className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">
                  Identificador único (slug){" "}
                  <span className="text-red-400">*</span>
                </Label>
                <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors relative">
                  <div className="flex items-center gap-3 flex-1">
                    <Settings className="h-5 w-5 text-gray-400" />
                    <input
                      id="slug"
                      type="text"
                      placeholder="mi-organizacion"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      onBlur={handleSlugBlur}
                      required
                      disabled={isLoading}
                      className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40 pr-8"
                    />
                  </div>
                  {isCheckingSlug && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400 dark:text-white/40" />
                    </div>
                  )}
                  {!isCheckingSlug && slugAvailable === true && formData.slug !== organization.slug && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  {!isCheckingSlug && slugAvailable === false && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                {slugAvailable === false && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    Este slug ya está en uso. Por favor, elige otro.
                  </p>
                )}
                {slugAvailable === true && formData.slug !== organization.slug && (
                  <p className="text-xs text-green-600 dark:text-green-400">¡Slug disponible!</p>
                )}
                <p className="text-xs text-gray-600 dark:text-white/40">
                  Este será usado en URLs: hunt-tickets.com/org/{formData.slug || "..."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brebKey" className="text-sm font-medium">
                  Llave Bre-B
                </Label>
                <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                    <input
                      id="brebKey"
                      type="text"
                      placeholder="Número de celular, cédula, correo o código alfanumérico"
                      value={formData.brebKey}
                      onChange={(e) => setFormData({ ...formData, brebKey: e.target.value })}
                      disabled={isLoading}
                      className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-white/40">
                  Necesario para recibir los pagos del programa de referidos. Puedes usar tu número de celular, cédula, correo o código alfanumérico del banco.
                </p>
              </div>

              {/* Public Contact Information Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-[#2a2a2a] space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Información de Contacto Público</h4>
                  <p className="text-xs text-gray-600 dark:text-white/40">
                    Esta información será visible para los usuarios en los eventos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publicPhone" className="text-sm font-medium">
                    Teléfono de contacto público
                  </Label>
                  <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <input
                        id="publicPhone"
                        type="tel"
                        placeholder="+57 300 123 4567"
                        value={formData.publicPhone}
                        onChange={(e) => setFormData({ ...formData, publicPhone: e.target.value })}
                        disabled={isLoading}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publicEmail" className="text-sm font-medium">
                    Correo de contacto público
                  </Label>
                  <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <input
                        id="publicEmail"
                        type="email"
                        placeholder="contacto@empresa.com"
                        value={formData.publicEmail}
                        onChange={(e) => setFormData({ ...formData, publicEmail: e.target.value })}
                        disabled={isLoading}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Logo */}
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-sm font-medium">
                Logo
              </Label>
              <div className="flex flex-col items-center gap-4">
                {/* Logo Preview - Always Square */}
                {logoPreview ? (
                  <div className="w-full space-y-3">
                    <div className="w-full aspect-square max-w-[300px] mx-auto rounded-xl border-2 border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    {/* Change Image Button */}
                    <label
                      htmlFor="logo-input"
                      className="w-full max-w-[300px] mx-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors cursor-pointer text-sm font-medium"
                    >
                      <Upload className="h-4 w-4" />
                      Cambiar imagen
                    </label>
                  </div>
                ) : (
                  <label
                    htmlFor="logo-input"
                    className="w-full aspect-square max-w-[300px] rounded-xl border-2 border-dashed border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 dark:hover:border-[#3a3a3a] transition-colors group"
                  >
                    <div className="text-center p-6">
                      <Upload className="h-12 w-12 text-gray-400 dark:text-white/30 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-white/50 mb-1">
                        Haz clic para subir logo
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/40">
                        PNG, JPG o WEBP (máx. 5MB)
                      </p>
                    </div>
                  </label>
                )}

                {/* Hidden File Input */}
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={isLoading}
                  className="hidden"
                />

                <p className="text-xs text-gray-600 dark:text-white/40 text-center">
                  La imagen será recortada en formato cuadrado
                </p>
              </div>
            </div>
          </div>

          {/* Billing Information Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-[#2a2a2a]">
            <h3 className="text-lg font-semibold mb-4">Datos de Facturación</h3>

            {/* Person Type Toggle */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, personType: "natural" })}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.personType === "natural"
                      ? "bg-gray-100 dark:bg-white/10 text-foreground border border-gray-200 dark:border-white/20"
                      : "text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Persona Natural
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, personType: "juridica" })}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.personType === "juridica"
                      ? "bg-gray-100 dark:bg-white/10 text-foreground border border-gray-200 dark:border-white/20"
                      : "text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10"
                  }`}
                >
                  <Building className="h-4 w-4" />
                  Persona Jurídica
                </button>
              </div>

              {/* Natural Person Fields */}
              {formData.personType === "natural" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Nombres y apellidos completos <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                      <input
                        id="fullName"
                        type="text"
                        placeholder="Juan Pérez García"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        disabled={isLoading}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentType" className="text-sm font-medium">
                      Tipo de documento <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                      <select
                        id="documentType"
                        value={formData.documentType}
                        onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                        disabled={isLoading}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full"
                      >
                        <option value="">Selecciona un tipo</option>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="PA">Pasaporte</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentNumber" className="text-sm font-medium">
                      Número de identificación <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                      <input
                        id="documentNumber"
                        type="text"
                        placeholder="1234567890"
                        value={formData.documentNumber}
                        onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                        disabled={isLoading}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Dirección <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                      <input
                        id="address"
                        type="text"
                        placeholder="Calle 123 #45-67"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={isLoading}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Correo electrónico <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                      <input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isLoading}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rut" className="text-sm font-medium">
                      RUT <span className="text-red-400">*</span>
                    </Label>
                    {formData.rut ? (
                      <div className="space-y-2">
                        {/* PDF Preview */}
                        <div className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] overflow-hidden aspect-[8.5/11]">
                          <iframe
                            src={`${formData.rut}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title="RUT Preview"
                          />
                        </div>
                        {/* Change File Button */}
                        <div className="flex gap-2">
                          <label
                            htmlFor="rut-input"
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors cursor-pointer text-sm font-medium flex-1"
                          >
                            <Upload className="h-4 w-4" />
                            Cambiar archivo
                          </label>
                          <button
                            type="button"
                            onClick={() => window.open(formData.rut, '_blank')}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors text-sm font-medium"
                          >
                            Ver completo
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, rut: "" })}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="rut-input"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors cursor-pointer text-sm font-medium w-full"
                      >
                        <FileText className="h-4 w-4 text-gray-400" />
                        Subir RUT (PDF)
                      </label>
                    )}
                    <input
                      id="rut-input"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileUpload(e, "rut")}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-600 dark:text-white/40">
                      Archivo PDF, máximo 5MB
                    </p>
                  </div>
                </div>
              )}

              {/* Legal Entity Fields */}
              {formData.personType === "juridica" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="legalName" className="text-sm font-medium">
                      Razón social completa <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                      <input
                        id="legalName"
                        type="text"
                        placeholder="Empresa S.A.S."
                        value={formData.legalName}
                        onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                        disabled={isLoading}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nit" className="text-sm font-medium">
                      NIT <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors flex-1">
                        <input
                          id="nit"
                          type="text"
                          placeholder="900123456"
                          value={formData.nit}
                          onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                          disabled={isLoading}
                          className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                        />
                      </div>
                      <span className="text-gray-400 dark:text-white/40">-</span>
                      <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors w-16">
                        <input
                          id="nitVerification"
                          type="text"
                          placeholder="7"
                          maxLength={1}
                          value={formData.nitVerification}
                          onChange={(e) => setFormData({ ...formData, nitVerification: e.target.value })}
                          disabled={isLoading}
                          className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full text-center placeholder:text-gray-500 dark:placeholder:text-white/40"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-white/40">
                      Ingresa el NIT y su dígito de verificación por separado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalAddress" className="text-sm font-medium">
                      Dirección del domicilio social <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                      <input
                        id="legalAddress"
                        type="text"
                        placeholder="Carrera 7 #12-34, Bogotá"
                        value={formData.legalAddress}
                        onChange={(e) => setFormData({ ...formData, legalAddress: e.target.value })}
                        disabled={isLoading}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalEmail" className="text-sm font-medium">
                      Correo electrónico <span className="text-red-400">*</span>
                    </Label>
                    <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                      <input
                        id="legalEmail"
                        type="email"
                        placeholder="contacto@empresa.com"
                        value={formData.legalEmail}
                        onChange={(e) => setFormData({ ...formData, legalEmail: e.target.value })}
                        disabled={isLoading}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalRut" className="text-sm font-medium">
                      RUT <span className="text-red-400">*</span>
                    </Label>
                    {formData.legalRut ? (
                      <div className="space-y-2">
                        {/* PDF Preview */}
                        <div className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] overflow-hidden aspect-[8.5/11]">
                          <iframe
                            src={`${formData.legalRut}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title="RUT Legal Preview"
                          />
                        </div>
                        {/* Change File Button */}
                        <div className="flex gap-2">
                          <label
                            htmlFor="legal-rut-input"
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors cursor-pointer text-sm font-medium flex-1"
                          >
                            <Upload className="h-4 w-4" />
                            Cambiar archivo
                          </label>
                          <button
                            type="button"
                            onClick={() => window.open(formData.legalRut, '_blank')}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors text-sm font-medium"
                          >
                            Ver completo
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, legalRut: "" })}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="legal-rut-input"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors cursor-pointer text-sm font-medium w-full"
                      >
                        <FileText className="h-4 w-4 text-gray-400" />
                        Subir RUT (PDF)
                      </label>
                    )}
                    <input
                      id="legal-rut-input"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileUpload(e, "legalRut")}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-600 dark:text-white/40">
                      Archivo PDF, máximo 5MB
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cerl" className="text-sm font-medium">
                      CERL <span className="text-red-400">*</span>
                    </Label>
                    {formData.cerl ? (
                      <div className="space-y-2">
                        {/* PDF Preview */}
                        <div className="w-full rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] overflow-hidden aspect-[8.5/11]">
                          <iframe
                            src={`${formData.cerl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title="CERL Preview"
                          />
                        </div>
                        {/* Change File Button */}
                        <div className="flex gap-2">
                          <label
                            htmlFor="cerl-input"
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors cursor-pointer text-sm font-medium flex-1"
                          >
                            <Upload className="h-4 w-4" />
                            Cambiar archivo
                          </label>
                          <button
                            type="button"
                            onClick={() => window.open(formData.cerl, '_blank')}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors text-sm font-medium"
                          >
                            Ver completo
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, cerl: "" })}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="cerl-input"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors cursor-pointer text-sm font-medium w-full"
                      >
                        <FileText className="h-4 w-4 text-gray-400" />
                        Subir CERL (PDF)
                      </label>
                    )}
                    <input
                      id="cerl-input"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleFileUpload(e, "cerl")}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-600 dark:text-white/40">
                      Certificado de Existencia y Representación Legal (PDF, máx. 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
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
                className="w-full sm:w-auto"
              >
                Descartar cambios
              </Button>
            </div>
          )}

          {!hasChanges && (
            <p className="text-xs text-gray-600 dark:text-white/40 pt-4">
              No hay cambios pendientes
            </p>
          )}
        </form>

        {/* Image Crop Dialog */}
        <ImageCropDialog
          open={cropDialogOpen}
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onClose={() => setCropDialogOpen(false)}
        />
      </CardContent>
    </Card>
  );
}
