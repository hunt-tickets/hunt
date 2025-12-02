"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createEvent,
  type EventFormState,
} from "@/lib/supabase/actions/events";
import { CreateEventSubmitButton } from "@/components/create-event-submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Plus } from "lucide-react";
import { HoverButton } from "@/components/ui/hover-glow-button";

interface VenueOption {
  id: string;
  name: string;
}

interface CreateEventDialogProps {
  className?: string;
  eventVenues?: VenueOption[];
  organizationId: string;
}

const initialState: EventFormState = {
  message: undefined,
  errors: {},
  success: false,
};

interface StatusSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

function StatusSelect({
  label,
  name,
  value,
  onChange,
}: StatusSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-10 bg-background/50 border-[#303030]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" align="start">
          <SelectItem value="Activo">Activo</SelectItem>
          <SelectItem value="Inactivo">Inactivo</SelectItem>
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

export function CreateEventDialog({
  className,
  eventVenues = [],
  organizationId,
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createEvent, initialState);

  // Form field states for controlled selects and dates
  const [venueId, setVenueId] = useState("");
  const [age, setAge] = useState("");
  const [status, setStatus] = useState("Inactivo");
  const [cashSales, setCashSales] = useState("Inactivo");
  const [priority, setPriority] = useState("Inactivo");
  const [lists, setLists] = useState("Inactivo");
  const [courtesies, setCourtesies] = useState("Inactivo");
  const [guestList, setGuestList] = useState("Inactivo");

  // Close dialog on success
  useEffect(() => {
    if (state.success) {
      // Reset form
      setVenueId("");
      setAge("");
      setStatus("Inactivo");
      setCashSales("Inactivo");
      setPriority("Inactivo");
      setLists("Inactivo");
      setCourtesies("Inactivo");
      setGuestList("Inactivo");
      setOpen(false);
    }
  }, [state.success]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <HoverButton
        onClick={() => setOpen(true)}
        className={`flex flex-row items-center justify-center gap-2 px-6 py-3 rounded-full whitespace-nowrap text-sm font-medium bg-primary text-primary-foreground ${className}`}
        glowColor="#000000"
        backgroundColor="transparent"
        textColor="inherit"
        hoverTextColor="inherit"
      >
        <Plus className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
        <span className="hidden sm:inline">Crear Evento</span>
      </HoverButton>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl lg:max-w-2xl p-0 bg-[#101010] border-l border-[#303030] overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-6 border-b border-[#303030] bg-[#101010] sticky top-0 z-10">
            <SheetTitle
              className="text-2xl font-bold"
              style={{ fontFamily: "LOT, sans-serif" }}
            >
              CREAR EVENTO
            </SheetTitle>
            <p className="text-sm text-[#B0B0B0] mt-2">
              Completa la información para crear un nuevo evento
            </p>
          </SheetHeader>

          {/* Form Content */}
          <div className="flex-1 px-6 py-6">
            <form
              action={formAction}
              className="space-y-8"
              id="create-event-form"
            >
              {/* Hidden organization ID */}
              <input type="hidden" name="organization_id" value={organizationId} />

              {/* Error message */}
              {state.message && !state.success && (
                <Alert
                  variant="destructive"
                  className="border-destructive/50 bg-destructive/10"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

              {/* Success message */}
              {state.message && state.success && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    {state.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B0B0B0]">
                  Información Básica
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nombre del Evento
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Fiesta de Año Nuevo"
                    className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                  />
                  {state.errors?.name && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.name[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe el evento..."
                    className="min-h-[100px] resize-none bg-background/50 border-[#303030] focus-visible:ring-primary"
                  />
                  {state.errors?.description && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.description[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Fechas y Horarios */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B0B0B0]">
                  Fechas y Horarios
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-sm font-medium">
                      Fecha de Inicio
                    </Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    {state.errors?.start_date && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.start_date[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_time" className="text-sm font-medium">
                      Hora de Inicio
                    </Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    {state.errors?.start_time && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.start_time[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-sm font-medium">
                      Fecha de Finalización
                    </Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    {state.errors?.end_date && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.end_date[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time" className="text-sm font-medium">
                      Hora de Finalización
                    </Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    {state.errors?.end_time && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.end_time[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ubicación y Detalles */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B0B0B0]">
                  Ubicación y Detalles
                </h3>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Venue
                  </Label>
                  <Select value={venueId} onValueChange={setVenueId}>
                    <SelectTrigger className="h-10 bg-background/50 border-[#303030]">
                      <SelectValue placeholder="Seleccione un venue" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="start"
                      className="max-h-[200px]"
                    >
                      {eventVenues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="venue_id" value={venueId} />
                  {state.errors?.venue_id && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.venue_id[0]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">
                      Ciudad
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Ej: Bogotá"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    {state.errors?.city && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.city[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">
                      País
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      placeholder="Ej: Colombia"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    {state.errors?.country && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.country[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Edad Mínima
                    </Label>
                    <Select value={age} onValueChange={setAge}>
                      <SelectTrigger className="h-10 bg-background/50 border-[#303030]">
                        <SelectValue placeholder="Seleccione edad" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        side="bottom"
                        align="start"
                      >
                        <SelectItem value="0">0+</SelectItem>
                        <SelectItem value="12">12+</SelectItem>
                        <SelectItem value="15">15+</SelectItem>
                        <SelectItem value="18">18+</SelectItem>
                        <SelectItem value="21">21+</SelectItem>
                        <SelectItem value="25">25+</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="age" value={age} />
                    {state.errors?.age && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.age[0]}
                      </p>
                    )}
                  </div>

                  <StatusSelect
                    label="Estado"
                    name="status"
                    value={status}
                    onChange={setStatus}
                  />
                </div>
              </div>

              {/* Información Adicional */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B0B0B0]">
                  Información Adicional
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="extra_info" className="text-sm font-medium">
                    Información Extra
                  </Label>
                  <Textarea
                    id="extra_info"
                    name="extra_info"
                    placeholder="Información adicional sobre el evento..."
                    className="min-h-[80px] resize-none bg-background/50 border-[#303030] focus-visible:ring-primary"
                  />
                  {state.errors?.extra_info && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.extra_info[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Imágenes */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B0B0B0]">
                  Imágenes
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flyer" className="text-sm font-medium">
                      Flyer del Evento
                    </Label>
                    <Input
                      id="flyer"
                      name="flyer"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="h-10 cursor-pointer bg-background/50 border-[#303030]"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Imagen principal del evento (Máx. 5MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wallet" className="text-sm font-medium">
                      Imagen para Wallet
                    </Label>
                    <Input
                      id="wallet"
                      name="wallet"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="h-10 cursor-pointer bg-background/50 border-[#303030]"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Para Apple/Google Wallet (Máx. 5MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="flyer_overlay" className="text-sm font-medium">
                      Flyer Overlay
                    </Label>
                    <Input
                      id="flyer_overlay"
                      name="flyer_overlay"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="h-10 cursor-pointer bg-background/50 border-[#303030]"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Imagen de overlay (Máx. 5MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="flyer_background" className="text-sm font-medium">
                      Flyer Background
                    </Label>
                    <Input
                      id="flyer_background"
                      name="flyer_background"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="h-10 cursor-pointer bg-background/50 border-[#303030]"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Imagen de fondo (Máx. 5MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="flyer_banner" className="text-sm font-medium">
                      Flyer Banner
                    </Label>
                    <Input
                      id="flyer_banner"
                      name="flyer_banner"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="h-10 cursor-pointer bg-background/50 border-[#303030]"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Banner del evento (Máx. 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Tarifas y Comisiones */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B0B0B0]">
                  Tarifas y Comisiones
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variable_fee" className="text-sm font-medium">
                      Tarifa Variable (%)
                    </Label>
                    <Input
                      id="variable_fee"
                      name="variable_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ej: 10.00"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Porcentaje de comisión sobre el precio del ticket
                    </p>
                    {state.errors?.variable_fee && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.variable_fee[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fixed_fee" className="text-sm font-medium">
                      Tarifa Fija
                    </Label>
                    <Input
                      id="fixed_fee"
                      name="fixed_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ej: 5000"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Monto fijo de comisión por ticket
                    </p>
                    {state.errors?.fixed_fee && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.fixed_fee[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pos_fee" className="text-sm font-medium">
                      Tarifa POS
                    </Label>
                    <Input
                      id="pos_fee"
                      name="pos_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ej: 3000"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Tarifa para ventas en punto de venta
                    </p>
                    {state.errors?.pos_fee && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.pos_fee[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="late_fee" className="text-sm font-medium">
                      Tarifa Tardía
                    </Label>
                    <Input
                      id="late_fee"
                      name="late_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ej: 2000"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Tarifa adicional para compras tardías
                    </p>
                    {state.errors?.late_fee && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.late_fee[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personalización */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B0B0B0]">
                  Personalización de Tema
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hex" className="text-sm font-medium">
                      Color Principal (Hex)
                    </Label>
                    <Input
                      id="hex"
                      name="hex"
                      type="text"
                      placeholder="Ej: #FF5733"
                      maxLength={7}
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Color del tema del evento
                    </p>
                    {state.errors?.hex && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.hex[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hex_text" className="text-sm font-medium">
                      Color de Texto (Hex)
                    </Label>
                    <Input
                      id="hex_text"
                      name="hex_text"
                      type="text"
                      placeholder="Ej: #FFFFFF"
                      maxLength={7}
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Color del texto principal
                    </p>
                    {state.errors?.hex_text && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.hex_text[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hex_text_secondary" className="text-sm font-medium">
                      Color Texto Secundario
                    </Label>
                    <Input
                      id="hex_text_secondary"
                      name="hex_text_secondary"
                      type="text"
                      placeholder="Ej: #A3A3A3"
                      maxLength={7}
                      defaultValue="#A3A3A3"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Color del texto secundario
                    </p>
                    {state.errors?.hex_text_secondary && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.hex_text_secondary[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Configuración de Ventas */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B0B0B0]">
                  Configuración de Ventas
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatusSelect
                    label="Venta en Efectivo"
                    name="cash_sales"
                    value={cashSales}
                    onChange={setCashSales}
                  />

                  <StatusSelect
                    label="Prioridad"
                    name="priority"
                    value={priority}
                    onChange={setPriority}
                  />

                  <StatusSelect
                    label="Listas"
                    name="lists"
                    value={lists}
                    onChange={setLists}
                  />

                  <StatusSelect
                    label="Cortesías"
                    name="courtesies"
                    value={courtesies}
                    onChange={setCourtesies}
                  />
                </div>
              </div>

              {/* Guest List */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#B0B0B0]">
                  Guest List
                </h3>

                <StatusSelect
                  label="Habilitar Guest List"
                  name="guest_list"
                  value={guestList}
                  onChange={setGuestList}
                />

                <div className="space-y-2">
                  <Label
                    htmlFor="guest_list_quantity"
                    className="text-sm font-medium"
                  >
                    Cantidad Máxima
                  </Label>
                  <Input
                    id="guest_list_quantity"
                    name="guest_list_quantity"
                    type="number"
                    placeholder="Ej: 100"
                    min="0"
                    className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                  />
                  {state.errors?.guest_list_quantity && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.guest_list_quantity[0]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="guest_list_max_date"
                      className="text-sm font-medium"
                    >
                      Fecha Límite
                    </Label>
                    <Input
                      id="guest_list_max_date"
                      name="guest_list_max_date"
                      type="date"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Fecha límite para guest list
                    </p>
                    {state.errors?.guest_list_max_date && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.guest_list_max_date[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="guest_list_max_time"
                      className="text-sm font-medium"
                    >
                      Hora Límite
                    </Label>
                    <Input
                      id="guest_list_max_time"
                      name="guest_list_max_time"
                      type="time"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Hora límite para guest list
                    </p>
                    {state.errors?.guest_list_max_time && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.guest_list_max_time[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="guest_email"
                      className="text-sm font-medium"
                    >
                      Email de Contacto
                    </Label>
                    <Input
                      id="guest_email"
                      name="guest_email"
                      type="email"
                      placeholder="contacto@ejemplo.com"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Email para consultas de guest list
                    </p>
                    {state.errors?.guest_email && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.guest_email[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="guest_name"
                      className="text-sm font-medium"
                    >
                      Nombre de Contacto
                    </Label>
                    <Input
                      id="guest_name"
                      name="guest_name"
                      placeholder="Ej: Juan Pérez"
                      className="h-10 bg-background/50 border-[#303030] focus-visible:ring-primary"
                    />
                    <p className="text-xs text-[#B0B0B0]">
                      Nombre de la persona a cargo del guest list
                    </p>
                    {state.errors?.guest_name && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.guest_name[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="guest_list_info"
                    className="text-sm font-medium"
                  >
                    Información Adicional
                  </Label>
                  <Textarea
                    id="guest_list_info"
                    name="guest_list_info"
                    placeholder="Información adicional sobre el guest list..."
                    className="min-h-[80px] resize-none bg-background/50 border-[#303030] focus-visible:ring-primary"
                  />
                  {state.errors?.guest_list_info && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.guest_list_info[0]}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Footer with buttons */}
          <div className="px-6 py-4 border-t border-[#303030] bg-[#101010] sticky bottom-0 z-10">
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-10 px-6 border-[#303030] hover:bg-white/5"
              >
                Cancelar
              </Button>
              <CreateEventSubmitButton form="create-event-form" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
