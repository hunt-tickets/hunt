"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Billing info for natural person
interface NaturalPersonBilling {
  personType: "natural";
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  emailFactura: string;
  confirmacionEmail: string;
}

// Billing info for juridical person (company)
interface JuridicalPersonBilling {
  personType: "juridica";
  razonSocial: string;
  nit: string;
  emailFactura: string;
  confirmacionEmail: string;
}

export type BillingInfo = NaturalPersonBilling | JuridicalPersonBilling;

interface BillingInfoDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (billingInfo: BillingInfo) => void;
  isProcessing?: boolean;
  // Pre-fill data from user profile
  defaultValues?: {
    tipoPersona?: string | null; // "natural", "juridica", or null (defaults to natural)
    documentTypeId?: string | null;
    documentId?: string | null;
    nombres?: string | null;
    apellidos?: string | null;
    razonSocial?: string | null;
    nit?: string | null;
    email?: string;
  };
  documentTypes: Array<{ id: string; name: string }>;
}

export function BillingInfoDialog({
  open,
  onClose,
  onSubmit,
  isProcessing = false,
  defaultValues,
  documentTypes,
}: BillingInfoDialogProps) {
  // Determine person type from profile (default to "natural" if null or undefined)
  const userPersonType = (defaultValues?.tipoPersona === "juridica" ? "juridica" : "natural") as "natural" | "juridica";

  const [useDifferentBilling, setUseDifferentBilling] = useState<"no" | "yes">("no");

  // Natural person form data
  const [naturalFormData, setNaturalFormData] = useState<Omit<NaturalPersonBilling, "personType">>({
    tipoDocumento: "",
    numeroDocumento: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    emailFactura: "",
    confirmacionEmail: "",
  });

  // Juridical person form data
  const [juridicalFormData, setJuridicalFormData] = useState<Omit<JuridicalPersonBilling, "personType">>({
    razonSocial: "",
    nit: "",
    emailFactura: "",
    confirmacionEmail: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form when dialog opens or when switching back to "No"
  useEffect(() => {
    if (open && defaultValues && useDifferentBilling === "no") {
      if (userPersonType === "natural") {
        // Split nombres into primer and segundo nombre
        const nombres = (defaultValues.nombres || "").split(" ").filter(Boolean);
        const apellidos = (defaultValues.apellidos || "").split(" ").filter(Boolean);

        setNaturalFormData({
          tipoDocumento: defaultValues.documentTypeId || "",
          numeroDocumento: defaultValues.documentId || "",
          primerNombre: nombres[0] || "",
          segundoNombre: nombres.slice(1).join(" ") || "",
          primerApellido: apellidos[0] || "",
          segundoApellido: apellidos.slice(1).join(" ") || "",
          emailFactura: defaultValues.email || "",
          confirmacionEmail: defaultValues.email || "",
        });
      } else {
        // Juridical person
        setJuridicalFormData({
          razonSocial: defaultValues.razonSocial || "",
          nit: defaultValues.nit || "",
          emailFactura: defaultValues.email || "",
          confirmacionEmail: defaultValues.email || "",
        });
      }
    }
  }, [open, defaultValues, useDifferentBilling, userPersonType]);

  // Clear form when switching to "Yes"
  const handleBillingTypeChange = (value: "no" | "yes") => {
    setUseDifferentBilling(value);
    if (value === "yes") {
      // Clear the form for manual entry
      if (userPersonType === "natural") {
        setNaturalFormData({
          tipoDocumento: "",
          numeroDocumento: "",
          primerNombre: "",
          segundoNombre: "",
          primerApellido: "",
          segundoApellido: "",
          emailFactura: "",
          confirmacionEmail: "",
        });
      } else {
        setJuridicalFormData({
          razonSocial: "",
          nit: "",
          emailFactura: "",
          confirmacionEmail: "",
        });
      }
      setErrors({});
    }
  };

  const validateNatural = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!naturalFormData.tipoDocumento) newErrors.tipoDocumento = "Requerido";
    if (!naturalFormData.numeroDocumento) newErrors.numeroDocumento = "Requerido";
    if (!naturalFormData.primerNombre) newErrors.primerNombre = "Requerido";
    if (!naturalFormData.primerApellido) newErrors.primerApellido = "Requerido";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!naturalFormData.emailFactura) {
      newErrors.emailFactura = "Requerido";
    } else if (!emailRegex.test(naturalFormData.emailFactura)) {
      newErrors.emailFactura = "Email inválido";
    }

    if (!naturalFormData.confirmacionEmail) {
      newErrors.confirmacionEmail = "Requerido";
    } else if (naturalFormData.emailFactura !== naturalFormData.confirmacionEmail) {
      newErrors.confirmacionEmail = "Los emails no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateJuridical = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!juridicalFormData.razonSocial) newErrors.razonSocial = "Requerido";
    if (!juridicalFormData.nit) newErrors.nit = "Requerido";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!juridicalFormData.emailFactura) {
      newErrors.emailFactura = "Requerido";
    } else if (!emailRegex.test(juridicalFormData.emailFactura)) {
      newErrors.emailFactura = "Email inválido";
    }

    if (!juridicalFormData.confirmacionEmail) {
      newErrors.confirmacionEmail = "Requerido";
    } else if (juridicalFormData.emailFactura !== juridicalFormData.confirmacionEmail) {
      newErrors.confirmacionEmail = "Los emails no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (userPersonType === "natural") {
      if (validateNatural()) {
        onSubmit({ personType: "natural", ...naturalFormData });
      }
    } else {
      if (validateJuridical()) {
        onSubmit({ personType: "juridica", ...juridicalFormData });
      }
    }
  };

  const handleNaturalChange = (field: keyof Omit<NaturalPersonBilling, "personType">, value: string) => {
    setNaturalFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleJuridicalChange = (field: keyof Omit<JuridicalPersonBilling, "personType">, value: string) => {
    setJuridicalFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isFormDisabled = isProcessing || useDifferentBilling === "no";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Información de Facturación</DialogTitle>
          <DialogDescription>
            Por favor completa la siguiente información para generar tu factura
            electrónica
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question: Change billing name? */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Label className="text-base font-medium">
              ¿Desea cambiar el nombre del cliente de la factura?
            </Label>
            <RadioGroup
              value={useDifferentBilling}
              onValueChange={handleBillingTypeChange}
              disabled={isProcessing}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="billing-no" />
                <Label htmlFor="billing-no" className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="billing-yes" />
                <Label htmlFor="billing-yes" className="font-normal cursor-pointer">
                  Sí
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional form based on person type */}
          {userPersonType === "natural" ? (
            /* NATURAL PERSON FORM */
            <>
              {/* Tipo de Documento */}
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">
                  Tipo de Documento <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={naturalFormData.tipoDocumento}
                  onValueChange={(value) => handleNaturalChange("tipoDocumento", value)}
                  disabled={isFormDisabled}
                >
                  <SelectTrigger className={errors.tipoDocumento ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoDocumento && (
                  <p className="text-xs text-red-500">{errors.tipoDocumento}</p>
                )}
              </div>

              {/* Número de Documento */}
              <div className="space-y-2">
                <Label htmlFor="numeroDocumento">
                  Número de Documento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numeroDocumento"
                  value={naturalFormData.numeroDocumento}
                  onChange={(e) => handleNaturalChange("numeroDocumento", e.target.value)}
                  disabled={isFormDisabled}
                  className={errors.numeroDocumento ? "border-red-500" : ""}
                />
                {errors.numeroDocumento && (
                  <p className="text-xs text-red-500">{errors.numeroDocumento}</p>
                )}
              </div>

              {/* Nombres - Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primerNombre">
                    Primer Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="primerNombre"
                    value={naturalFormData.primerNombre}
                    onChange={(e) => handleNaturalChange("primerNombre", e.target.value)}
                    disabled={isFormDisabled}
                    className={errors.primerNombre ? "border-red-500" : ""}
                  />
                  {errors.primerNombre && (
                    <p className="text-xs text-red-500">{errors.primerNombre}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segundoNombre">Segundo Nombre</Label>
                  <Input
                    id="segundoNombre"
                    value={naturalFormData.segundoNombre}
                    onChange={(e) => handleNaturalChange("segundoNombre", e.target.value)}
                    disabled={isFormDisabled}
                  />
                </div>
              </div>

              {/* Apellidos - Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primerApellido">
                    Primer Apellido <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="primerApellido"
                    value={naturalFormData.primerApellido}
                    onChange={(e) => handleNaturalChange("primerApellido", e.target.value)}
                    disabled={isFormDisabled}
                    className={errors.primerApellido ? "border-red-500" : ""}
                  />
                  {errors.primerApellido && (
                    <p className="text-xs text-red-500">{errors.primerApellido}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segundoApellido">Segundo Apellido</Label>
                  <Input
                    id="segundoApellido"
                    value={naturalFormData.segundoApellido}
                    onChange={(e) => handleNaturalChange("segundoApellido", e.target.value)}
                    disabled={isFormDisabled}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="emailFactura">
                  Correo Electrónico Factura Electrónica <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emailFactura"
                  type="email"
                  value={naturalFormData.emailFactura}
                  onChange={(e) => handleNaturalChange("emailFactura", e.target.value)}
                  disabled={isFormDisabled}
                  className={errors.emailFactura ? "border-red-500" : ""}
                />
                {errors.emailFactura && (
                  <p className="text-xs text-red-500">{errors.emailFactura}</p>
                )}
              </div>

              {/* Confirmación Email */}
              <div className="space-y-2">
                <Label htmlFor="confirmacionEmail">
                  Confirmación Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmacionEmail"
                  type="email"
                  value={naturalFormData.confirmacionEmail}
                  onChange={(e) => handleNaturalChange("confirmacionEmail", e.target.value)}
                  disabled={isFormDisabled}
                  className={errors.confirmacionEmail ? "border-red-500" : ""}
                />
                {errors.confirmacionEmail && (
                  <p className="text-xs text-red-500">{errors.confirmacionEmail}</p>
                )}
              </div>
            </>
          ) : (
            /* JURIDICAL PERSON FORM */
            <>
              {/* Razón Social */}
              <div className="space-y-2">
                <Label htmlFor="razonSocial">
                  Razón Social <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="razonSocial"
                  value={juridicalFormData.razonSocial}
                  onChange={(e) => handleJuridicalChange("razonSocial", e.target.value)}
                  disabled={isFormDisabled}
                  className={errors.razonSocial ? "border-red-500" : ""}
                  placeholder="Nombre de la empresa"
                />
                {errors.razonSocial && (
                  <p className="text-xs text-red-500">{errors.razonSocial}</p>
                )}
              </div>

              {/* NIT */}
              <div className="space-y-2">
                <Label htmlFor="nit">
                  NIT <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nit"
                  value={juridicalFormData.nit}
                  onChange={(e) => handleJuridicalChange("nit", e.target.value)}
                  disabled={isFormDisabled}
                  className={errors.nit ? "border-red-500" : ""}
                  placeholder="NIT sin dígito de verificación"
                />
                {errors.nit && (
                  <p className="text-xs text-red-500">{errors.nit}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="emailFactura">
                  Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emailFactura"
                  type="email"
                  value={juridicalFormData.emailFactura}
                  onChange={(e) => handleJuridicalChange("emailFactura", e.target.value)}
                  disabled={isFormDisabled}
                  className={errors.emailFactura ? "border-red-500" : ""}
                />
                {errors.emailFactura && (
                  <p className="text-xs text-red-500">{errors.emailFactura}</p>
                )}
              </div>

              {/* Confirmación Email */}
              <div className="space-y-2">
                <Label htmlFor="confirmacionEmail">
                  Confirmación Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmacionEmail"
                  type="email"
                  value={juridicalFormData.confirmacionEmail}
                  onChange={(e) => handleJuridicalChange("confirmacionEmail", e.target.value)}
                  disabled={isFormDisabled}
                  className={errors.confirmacionEmail ? "border-red-500" : ""}
                />
                {errors.confirmacionEmail && (
                  <p className="text-xs text-red-500">{errors.confirmacionEmail}</p>
                )}
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Continuar al pago"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
