"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEventTabs } from "@/contexts/event-tabs-context";
import { toast } from "@/lib/toast";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import { FormSelect } from "@/components/ui/form-select";
import {
  EventTypeSelector,
  SingleDatePicker,
  type EventType,
  type EventDay,
} from "@/components/event-config";
import { updateEventConfiguration } from "@/actions/events";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Image as ImageIcon,
  Calendar,
  Upload,
  Trash2,
  DollarSign,
  Wallet,
  HelpCircle,
  Plus,
  Edit2,
  GripVertical,
  Globe,
  Coins,
  FileText,
  MapPinned,
  Info,
  ChevronRight,
  CalendarRange,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
} from "@/constants/event-categories";

interface EventDayData {
  id: string;
  name: string;
  date: string;
  endDate: string;
  sortOrder: number;
}

interface EventData {
  id: string;
  name: string;
  description?: string;
  category?: string;
  type?: "single" | "multi_day" | "recurring" | "slots";
  date?: string;
  end_date?: string;
  age?: number;
  variable_fee?: number;
  fixed_fee?: number;
  city?: string;
  country?: string;
  address?: string;
  venue_name?: string;
  flyer?: string;
  flyer_apple?: string;
  venue_id?: string;
  faqs?: Array<{ id: string; question: string; answer: string }>;
  days?: EventDayData[];
}

interface EventConfigContentProps {
  showTabsOnly?: boolean;
  showContentOnly?: boolean;
  eventData?: EventData;
  eventId?: string;
}

export function EventConfigContent({
  showTabsOnly = false,
  showContentOnly = false,
  eventData,
  eventId,
}: EventConfigContentProps = {}) {
  const params = useParams();
  const userId = params.userId as string;
  const organizationId = params.organizationId as string;

  const { configTab: activeTab, setConfigTab: setActiveTab } = useEventTabs();
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    category: "" as (typeof EVENT_CATEGORIES)[number] | "",
    venueName: "",
    city: "",
    country: "",
    address: "",
    startDate: "",
    endDate: "",
    age: 18,
    timezone: "America/Bogota",
    currency: "COP",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [eventType, setEventType] = useState<EventType>("single");
  const [eventDays, setEventDays] = useState<EventDay[]>([]);

  // Initialize form data when eventData is loaded
  useEffect(() => {
    if (eventData) {
      // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        eventName: eventData.name || "",
        description: eventData.description || "",
        category:
          (eventData.category as (typeof EVENT_CATEGORIES)[number]) || "",
        venueName: eventData.venue_name || "",
        city: eventData.city || "",
        country: eventData.country || "",
        address: eventData.address || "",
        startDate: eventData.date ? formatDateForInput(eventData.date) : "",
        endDate: eventData.end_date
          ? formatDateForInput(eventData.end_date)
          : "",
        age: eventData.age || 18,
        timezone: "America/Bogota",
        currency: "COP",
      });

      // Initialize images if available
      if (eventData.flyer) {
        setImages((prev) => ({ ...prev, banner: eventData.flyer || null }));
      }
      if (eventData.flyer_apple) {
        setWalletConfig((prev) => ({
          ...prev,
          logo: eventData.flyer_apple || null,
        }));
      }

      // Initialize FAQs if available
      if (eventData.faqs && Array.isArray(eventData.faqs)) {
        setFaqs(eventData.faqs);
      }

      // Initialize Hunt costs
      setHuntCosts({
        commissionPercentage: (eventData.variable_fee || 0) * 100,
        costPerTicket: eventData.fixed_fee || 0,
        description: "Comisión de Hunt por venta de tickets",
      });

      // Initialize event type and days
      setEventType(eventData.type || "single");
      if (eventData.days && eventData.days.length > 0) {
        setEventDays(
          eventData.days.map((d) => ({
            id: d.id,
            name: d.name,
            date: d.date ? formatDateForInput(d.date) : "",
            endDate: d.endDate ? formatDateForInput(d.endDate) : "",
            sortOrder: d.sortOrder,
          }))
        );
      }
    }
  }, [eventData]);

  const [huntCosts, setHuntCosts] = useState({
    commissionPercentage: 8,
    costPerTicket: 500,
    description: "Comisión de Hunt por venta de tickets",
  });

  const [images, setImages] = useState<{
    banner: string | null;
  }>({
    banner: null,
  });

  const [walletConfig, setWalletConfig] = useState<{
    backgroundColor: string;
    foregroundColor: string;
    labelColor: string;
    logo: string | null;
    icon: string | null;
    strip: string | null;
  }>({
    backgroundColor: "#000000",
    foregroundColor: "#FFFFFF",
    labelColor: "#999999",
    logo: null,
    icon: null,
    strip: null,
  });

  interface FAQ {
    id: string;
    question: string;
    answer: string;
  }

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [draggedFaqIndex, setDraggedFaqIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const tabs = [
    { id: "information", label: "Información", icon: Settings },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: "banner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => ({
          ...prev,
          [imageType]: (event.target?.result as string) || null,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWalletColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWalletConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWalletImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: "logo" | "icon" | "strip"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWalletConfig((prev) => ({
          ...prev,
          [imageType]: event.target?.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveFaqs = async (updatedFaqs: FAQ[]) => {
    if (!eventId) return;

    try {
      const { updateEventConfiguration } = await import("@/actions/events");

      const result = await updateEventConfiguration(eventId, {
        faqs: updatedFaqs,
      });

      if (!result.success) {
        console.error("Error al guardar FAQs:", result.message);
      }
    } catch (error) {
      console.error("Error saving FAQs:", error);
    }
  };

  const handleSaveConfig = async (section: string) => {
    if (!eventId) return;

    setIsSaving(true);

    try {
      if (section === "información") {
        // Save basic event info
        const result = await updateEventConfiguration(eventId, {
          name: formData.eventName,
          description: formData.description,
          category: formData.category || undefined,
          // Note: type is not editable after creation
          date: eventType === "single" ? formData.startDate : undefined,
          end_date: eventType === "single" ? formData.endDate : undefined,
          age: formData.age,
          city: formData.city,
          country: formData.country,
          address: formData.address,
          venue_name: formData.venueName,
          variable_fee: huntCosts.commissionPercentage / 100,
          fixed_fee: huntCosts.costPerTicket,
        });

        if (!result.success) {
          toast.error({
            title: result.message || "Error al guardar la configuración",
          });
          return;
        }

        toast.success({ title: "Configuración guardada exitosamente" });
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error({ title: "Error al guardar la configuración" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedFaqIndex(index);
    // Set drag image to be semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedFaqIndex !== null && draggedFaqIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedFaqIndex === null || draggedFaqIndex === dropIndex) {
      setDraggedFaqIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newFaqs = [...faqs];
    const draggedItem = newFaqs[draggedFaqIndex];

    // Remove from old position
    newFaqs.splice(draggedFaqIndex, 1);

    // Insert at new position
    newFaqs.splice(dropIndex, 0, draggedItem);

    setFaqs(newFaqs);
    saveFaqs(newFaqs); // Save to database
    setDraggedFaqIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedFaqIndex(null);
    setDragOverIndex(null);
  };

  // Tabs section
  const tabsSection = (
    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-gray-100 dark:bg-white/10 text-foreground border border-gray-200 dark:border-white/20"
                : "text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  // Content section
  const contentSection = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-4">
        {/* Information Section */}
        {activeTab === "information" && (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600 dark:text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle>Información Básica</CardTitle>
                    <CardDescription>
                      Detalles principales de tu evento
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Event Name */}
                <FormInput
                  id="eventName"
                  name="eventName"
                  label="Nombre del Evento"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="ej. Festival de Música 2024"
                  required
                />

                {/* Description */}
                <FormTextarea
                  id="description"
                  name="description"
                  label="Descripción"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe tu evento, artistas, atracciones y todo lo que los asistentes deben saber..."
                  hint="Esta descripción será visible para todos los usuarios"
                  rows={5}
                  maxLength={1000}
                  showCharCount
                />

                {/* Category */}
                <FormSelect
                  id="category"
                  name="category"
                  label="Categoría"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target
                        .value as (typeof EVENT_CATEGORIES)[number],
                    }))
                  }
                  hint="La categoría ayuda a que tu evento aparezca en búsquedas y filtros, aumentando su visibilidad"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {EVENT_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </FormSelect>

                {/* Age Restriction */}
                <FormSelect
                  id="age"
                  name="age"
                  label="Edad Mínima"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      age: parseInt(e.target.value),
                    }))
                  }
                  hint="Edad mínima requerida para asistir al evento"
                >
                  <option value="0">Para todo público</option>
                  <option value="12">12+</option>
                  <option value="18">18+</option>
                  <option value="21">21+</option>
                  <option value="25">25+</option>
                </FormSelect>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle>Ubicación</CardTitle>
                    <CardDescription>
                      Dónde se llevará a cabo el evento
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Venue Name */}
                <FormInput
                  id="venueName"
                  name="venueName"
                  label="Nombre del Lugar"
                  value={formData.venueName}
                  onChange={handleInputChange}
                  placeholder="ej. Movistar Arena, Club Colombia, Armando Records"
                  icon={<MapPinned className="h-4 w-4" />}
                />

                {/* Full Address with Google Places Autocomplete - TODO: Fix Google Maps types */}
                {/* <GooglePlacesAutocomplete
                label="Dirección"
                defaultValue={formData.address}
                onPlaceSelect={(place) => {
                  setFormData((prev) => ({
                    ...prev,
                    address: place.address,
                    city: place.city || prev.city,
                    country: place.country || prev.country,
                  }));
                }}
                required
              /> */}
                <FormInput
                  id="address"
                  name="address"
                  label="Dirección"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="ej. Calle 123 #45-67"
                  icon={<MapPinned className="h-4 w-4" />}
                />

                {/* City and Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    id="city"
                    name="city"
                    label="Ciudad"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="ej. Bogotá"
                  />
                  <FormInput
                    id="country"
                    name="country"
                    label="País"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="ej. Colombia"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Event Type Selection - Read Only */}
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle>Tipo de Evento</CardTitle>
                    <CardDescription>
                      El tipo de evento no se puede modificar después de crearlo
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <div className="opacity-60 pointer-events-none select-none blur-[1px]">
                    <EventTypeSelector
                      value={eventType}
                      onChange={() => {}}
                      disabled={true}
                    />
                  </div>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <svg
                        className="w-4 h-4 text-zinc-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        {eventType === "single" && "Evento único"}
                        {eventType === "multi_day" && "Evento de varios días"}
                        {eventType === "recurring" && "Evento recurrente"}
                        {eventType === "slots" && "Evento por horarios"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time Configuration - varies by event type */}
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle>
                      {eventType === "single" && "Fecha y Hora"}
                      {eventType === "multi_day" && "Días del Evento"}
                      {eventType === "recurring" && "Patrón de Repetición"}
                      {eventType === "slots" && "Horarios Disponibles"}
                    </CardTitle>
                    <CardDescription>
                      {eventType === "single" &&
                        "Cuándo se realizará el evento"}
                      {eventType === "multi_day" &&
                        "Configura cada día de tu evento"}
                      {eventType === "recurring" && "Próximamente"}
                      {eventType === "slots" && "Próximamente"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Single Event */}
                {eventType === "single" && (
                  <SingleDatePicker
                    startDate={formData.startDate}
                    endDate={formData.endDate}
                    onStartDateChange={(value) =>
                      setFormData((prev) => ({ ...prev, startDate: value }))
                    }
                    onEndDateChange={(value) =>
                      setFormData((prev) => ({ ...prev, endDate: value }))
                    }
                  />
                )}

                {/* Multi-Day Event - Link to dedicated page */}
                {eventType === "multi_day" && eventId && (
                  <Link
                    href={`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/configuracion/dias`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
                          <CalendarRange className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {eventDays.length > 0
                              ? `${eventDays.length} día${eventDays.length !== 1 ? "s" : ""} configurado${eventDays.length !== 1 ? "s" : ""}`
                              : "Configurar días del evento"}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {eventDays.length > 0
                              ? eventDays.map((d) => d.name).join(", ")
                              : "Agrega los días de tu festival"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </div>
                  </Link>
                )}

                {/* Recurring - Coming Soon */}
                {eventType === "recurring" && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-zinc-500">
                      La configuración de eventos recurrentes estará disponible
                      próximamente.
                    </p>
                  </div>
                )}

                {/* Slots - Coming Soon */}
                {eventType === "slots" && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-zinc-500">
                      La configuración de horarios estará disponible
                      próximamente.
                    </p>
                  </div>
                )}

                {/* Timezone - shown for all types */}
                <FormSelect
                  id="timezone"
                  name="timezone"
                  label="Zona Horaria"
                  icon={<Globe className="h-4 w-4" />}
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timezone: e.target.value,
                    }))
                  }
                  hint="Las fechas y horas se mostrarán según esta zona horaria"
                >
                  <option value="America/Bogota">Colombia (GMT-5)</option>
                  <option value="America/Mexico_City">México (GMT-6)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="America/Los_Angeles">
                    Los Angeles (GMT-8)
                  </option>
                  <option value="America/Chicago">Chicago (GMT-6)</option>
                  <option value="America/Argentina/Buenos_Aires">
                    Buenos Aires (GMT-3)
                  </option>
                  <option value="America/Santiago">Santiago (GMT-4)</option>
                  <option value="America/Lima">Lima (GMT-5)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                  <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                </FormSelect>
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle>Configuración Regional</CardTitle>
                    <CardDescription>
                      Moneda y formato de precios
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormSelect
                  id="currency"
                  name="currency"
                  label="Moneda"
                  icon={<DollarSign className="h-4 w-4" />}
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  hint="Todos los precios se mostrarán en esta moneda"
                >
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="USD">USD - Dólar Estadounidense</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="ARS">ARS - Peso Argentino</option>
                  <option value="CLP">CLP - Peso Chileno</option>
                  <option value="PEN">PEN - Sol Peruano</option>
                  <option value="BRL">BRL - Real Brasileño</option>
                  <option value="GBP">GBP - Libra Esterlina</option>
                </FormSelect>
              </CardContent>
            </Card>

            {/* Banner Image */}
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle>Flyer del Evento</CardTitle>
                    <CardDescription>
                      Imagen principal del evento (formato póster vertical)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-white/50">
                  Recomendado: 900x1200px (ratio 3:4), máximo 5MB
                </p>

                {images.banner ? (
                  <div className="relative aspect-[3/4] max-w-xs rounded-lg overflow-hidden border border-white/10 bg-white/5">
                    <img
                      src={images.banner as string}
                      alt="Flyer preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setImages((prev) => ({ ...prev, banner: null }))
                      }
                      className="absolute top-2 right-2 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-[3/4] max-w-xs border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-500 dark:text-white/40 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-white/60 text-center px-4">
                        Haz clic o arrastra una imagen
                      </p>
                      <p className="text-xs text-gray-500 dark:text-white/40 mt-1">
                        Formato vertical 3:4
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "banner")}
                      className="hidden"
                    />
                  </label>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => handleSaveConfig("información")}
                className="rounded-lg px-8 bg-white text-black hover:bg-white/90"
                size="lg"
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        )}

        {/* Wallet Section */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Left Column - Configuration (3 columns) */}
              <div className="xl:col-span-3 space-y-6">
                {/* Colors Section */}
                <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500" />
                      <CardTitle className="text-base">
                        Paleta de Colores
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Personaliza los colores del ticket según tu marca
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {/* Background Color */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="backgroundColor"
                          className="text-sm font-medium flex items-center justify-between"
                        >
                          <span>Color de Fondo</span>
                          <span className="text-xs font-mono text-gray-500 dark:text-white/40">
                            {walletConfig.backgroundColor}
                          </span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="backgroundColor"
                            name="backgroundColor"
                            type="color"
                            value={walletConfig.backgroundColor}
                            onChange={handleWalletColorChange}
                            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
                          />
                          <div
                            className="h-12 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-inner"
                            style={{
                              backgroundColor: walletConfig.backgroundColor,
                            }}
                          >
                            <div className="h-full flex items-center justify-between px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-6 h-6 rounded-lg border-2 border-white/40 shadow-sm"
                                  style={{
                                    backgroundColor:
                                      walletConfig.backgroundColor,
                                  }}
                                />
                                <span className="text-sm font-medium text-white/90">
                                  Color principal del pass
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Foreground & Label Colors */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Foreground Color */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="foregroundColor"
                            className="text-sm font-medium flex items-center justify-between"
                          >
                            <span>Color de Texto</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="foregroundColor"
                              name="foregroundColor"
                              type="color"
                              value={walletConfig.foregroundColor}
                              onChange={handleWalletColorChange}
                              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                              className="h-12 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                              style={{
                                backgroundColor: walletConfig.foregroundColor,
                              }}
                            >
                              <div className="h-full flex items-center justify-center">
                                <span className="text-xs font-mono text-white/80 bg-black/30 px-2 py-1 rounded">
                                  {walletConfig.foregroundColor}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Label Color */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="labelColor"
                            className="text-sm font-medium flex items-center justify-between"
                          >
                            <span>Color de Etiquetas</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="labelColor"
                              name="labelColor"
                              type="color"
                              value={walletConfig.labelColor}
                              onChange={handleWalletColorChange}
                              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                              className="h-12 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                              style={{
                                backgroundColor: walletConfig.labelColor,
                              }}
                            >
                              <div className="h-full flex items-center justify-center">
                                <span className="text-xs font-mono text-white/80 bg-black/30 px-2 py-1 rounded">
                                  {walletConfig.labelColor}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Images Section */}
                <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-gray-600 dark:text-white/60" />
                      <CardTitle className="text-base">
                        Imágenes del Pass
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Sube las imágenes que aparecerán en el ticket digital
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-[25%_75%] gap-4">
                      {/* Logo - 30% */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Logo</Label>
                          <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">
                            160x50px
                          </p>
                        </div>

                        {walletConfig.logo ? (
                          <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center p-3">
                            <img
                              src={walletConfig.logo as string}
                              alt="Logo"
                              className="max-h-full max-w-full object-contain"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setWalletConfig((prev) => ({
                                  ...prev,
                                  logo: null,
                                }))
                              }
                              className="absolute top-2 right-2 h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group">
                            <Upload className="h-5 w-5 text-white/30 group-hover:text-white/50 transition-colors mb-1" />
                            <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors text-center px-2">
                              Subir logo
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleWalletImageUpload(e, "logo")
                              }
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Strip Image - 70% */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">
                            Imagen Strip
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">
                            375x123px • Aparece debajo del logo
                          </p>
                        </div>

                        {walletConfig.strip ? (
                          <div className="relative aspect-[375/123] rounded-xl overflow-hidden border border-white/10 bg-white/5">
                            <img
                              src={walletConfig.strip as string}
                              alt="Strip"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setWalletConfig((prev) => ({
                                  ...prev,
                                  strip: null,
                                }))
                              }
                              className="absolute top-2 right-2 h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center aspect-[375/123] border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group">
                            <Upload className="h-5 w-5 text-white/30 group-hover:text-white/50 transition-colors mb-1" />
                            <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                              Subir strip image
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleWalletImageUpload(e, "strip")
                              }
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <Button
                  onClick={() => handleSaveConfig("wallet")}
                  className="w-full h-12 rounded-xl bg-white text-black hover:bg-white/90 font-medium"
                  size="lg"
                >
                  Guardar Configuración de Wallet
                </Button>
              </div>

              {/* Right Column - Preview (2 columns) */}
              <div className="xl:col-span-2">
                <div className="sticky top-6">
                  <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
                    <CardHeader>
                      <CardTitle className="text-base">Vista Previa</CardTitle>
                      <CardDescription className="text-xs">
                        Así se verá el ticket en Apple Wallet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Apple Wallet Pass Preview */}
                      <div className="w-full max-w-[340px] mx-auto">
                        <div
                          className="relative rounded-[20px] overflow-hidden shadow-2xl border border-black/20"
                          style={{
                            backgroundColor: walletConfig.backgroundColor,
                          }}
                        >
                          {/* Header - Logo + Date/Time */}
                          <div className="px-5 pt-4 pb-3 flex items-start justify-between">
                            <div className="flex-1">
                              {walletConfig.logo ? (
                                <img
                                  src={walletConfig.logo as string}
                                  alt="Logo"
                                  className="max-h-[45px] max-w-[160px] object-contain"
                                />
                              ) : (
                                <div
                                  className="text-2xl font-bold"
                                  style={{
                                    color: walletConfig.foregroundColor,
                                  }}
                                >
                                  LOGO
                                </div>
                              )}
                            </div>

                            {/* Date/Time in corner */}
                            <div className="text-right">
                              <div
                                className="text-[11px] font-semibold tracking-wide"
                                style={{ color: walletConfig.foregroundColor }}
                              >
                                VIE, DIC 15
                              </div>
                              <div
                                className="text-2xl font-bold leading-none"
                                style={{ color: walletConfig.foregroundColor }}
                              >
                                8:00PM
                              </div>
                            </div>
                          </div>

                          {/* Strip Image */}
                          {walletConfig.strip ? (
                            <div className="w-full h-[100px] overflow-hidden">
                              <img
                                src={walletConfig.strip as string}
                                alt="Strip"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-[100px] bg-gradient-to-br from-white/10 to-white/5" />
                          )}

                          {/* Main Content */}
                          <div className="px-5 pt-4 pb-5">
                            {/* Event Title Section */}
                            <div className="mb-4">
                              <div
                                className="text-[11px] uppercase tracking-wide font-semibold mb-0.5"
                                style={{ color: walletConfig.labelColor }}
                              >
                                EVENTO
                              </div>
                              <div
                                className="text-xl font-bold leading-tight"
                                style={{ color: walletConfig.foregroundColor }}
                              >
                                Festival de Música
                              </div>
                            </div>

                            {/* Details Grid - 3 columns like AMC */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                              <div>
                                <div
                                  className="text-[10px] uppercase tracking-wide font-semibold mb-1"
                                  style={{ color: walletConfig.labelColor }}
                                >
                                  SECCIÓN
                                </div>
                                <div
                                  className="text-base font-bold"
                                  style={{
                                    color: walletConfig.foregroundColor,
                                  }}
                                >
                                  VIP
                                </div>
                              </div>
                              <div>
                                <div
                                  className="text-[10px] uppercase tracking-wide font-semibold mb-1"
                                  style={{ color: walletConfig.labelColor }}
                                >
                                  ASIENTOS
                                </div>
                                <div
                                  className="text-base font-bold"
                                  style={{
                                    color: walletConfig.foregroundColor,
                                  }}
                                >
                                  A12, A13
                                </div>
                              </div>
                              <div>
                                <div
                                  className="text-[10px] uppercase tracking-wide font-semibold mb-1"
                                  style={{ color: walletConfig.labelColor }}
                                >
                                  ENTRADAS
                                </div>
                                <div
                                  className="text-base font-bold"
                                  style={{
                                    color: walletConfig.foregroundColor,
                                  }}
                                >
                                  2 ADULT
                                </div>
                              </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center mt-6">
                              <div className="bg-white rounded-lg p-2.5 shadow-md">
                                <svg
                                  width="110"
                                  height="110"
                                  viewBox="0 0 29 29"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <rect width="29" height="29" fill="white" />
                                  <path
                                    d="M0 0h7v7h-7zM8 0h1v1h-1zM10 0h2v1h1v1h-1v1h-1v-2h-1zM13 0h1v2h1v-1h2v1h-1v1h-1v1h1v1h-2v-1h-1v1h-1v-3h1v1h1zM17 0h2v1h-2zM21 0h1v1h-1zM22 0h7v7h-7zM1 1v5h5v-5zM9 1h1v1h-1zM19 1h2v1h-2zM23 1v5h5v-5zM2 2h3v3h-3zM16 2h1v2h1v-1h1v2h-1v1h-1v-1h-1zM24 2h3v3h-3zM10 3h1v2h-1zM12 3h1v1h-1zM20 3h1v3h-1zM9 4h1v2h-1zM16 4h1v1h-1zM11 5h2v1h-2zM17 5h2v1h1v1h-1v-1h-2zM8 6h1v2h1v-1h1v2h-2v1h-1v1h-1v-4h1zM13 6h3v1h-1v1h-1v-1h-1zM21 6h1v2h-1zM0 8h1v2h-1zM2 8h3v1h-1v1h-1v1h2v-1h1v1h-1v2h-1v-3h-1v1h-1zM6 8h1v1h-1zM11 8h1v1h1v1h-2zM14 8h1v1h-1zM17 8h1v2h1v-1h2v1h-1v1h-2v1h-1v-1h-1v1h-2v-1h2v-2h1zM20 8h1v1h-1zM25 8h4v1h-4zM13 9h1v3h-1zM23 9h2v2h1v-1h1v3h-2v-1h-1v2h-1v-2h-1v1h-1v-1h1v-2h1zM7 10h1v1h-1zM9 10h3v1h-1v1h-1v-1h-1zM27 10h2v1h-2zM0 11h1v1h-1zM20 11h1v1h-1zM6 12h1v1h-1zM10 12h1v2h-1zM14 12h2v1h-2zM28 12h1v2h-1zM8 13h2v2h-1v1h-2v-2h1zM16 13h1v1h-1zM19 13h1v2h-1zM21 13h1v1h-1zM11 14h2v1h-2zM25 14h2v1h-2zM0 15h1v1h1v1h-2zM3 15h4v1h-1v1h-1v-1h-2zM14 15h3v1h1v1h-1v1h-1v-2h-2zM20 15h3v1h-3zM27 15h2v1h-2zM2 16h1v1h-1zM9 16h1v1h-1zM24 16h1v3h-1zM26 16h1v1h-1zM4 17h3v1h1v-1h1v1h-1v1h1v1h-2v1h-1v-3h-2zM10 17h2v1h1v2h-1v-1h-1v1h-1zM18 17h1v2h2v1h-3zM21 17h2v1h-2zM25 17h1v1h-1zM0 18h2v1h-2zM8 18h1v1h-1zM13 18h1v3h-1zM22 18h1v1h-1zM26 18h2v1h-1v1h1v2h-1v1h-1v-1h-1v-1h2v-2h-1zM2 19h1v1h-1zM14 19h1v1h-1zM21 19h1v2h-1zM23 19h1v2h-1zM8 20h1v1h-1zM10 20h2v1h-2zM16 20h2v1h-2zM25 20h1v1h-1zM0 21h7v7h-7zM9 21h1v1h-1zM14 21h4v1h1v1h-4v1h3v1h-1v1h-1v1h-2v-1h1v-1h-2v-2h1v-1h1zM22 21h1v1h-1zM1 22v5h5v-5zM19 22h2v2h-2zM8 23h1v3h1v-1h2v2h-3v1h-1v-2h1v-2h-1zM11 23h1v1h-1zM24 23h1v1h-1zM2 24h3v3h-3zM21 24h1v1h-1zM25 24h1v1h1v1h-2zM12 25h1v1h-1zM23 25h1v2h-1zM27 25h2v1h-2zM19 26h2v1h-2zM25 26h1v1h-1zM11 27h1v2h-1zM20 27h1v1h-1zM22 27h1v1h-1zM26 27h3v1h-3zM8 28h2v1h-2zM13 28h2v1h-2zM17 28h2v1h-2zM24 28h1v1h-1z"
                                    fill="black"
                                  />
                                </svg>
                              </div>
                            </div>

                            {/* Barcode/Ticket Number at bottom */}
                            <div className="mt-5 text-center">
                              <div
                                className="text-[11px] font-mono tracking-widest font-semibold"
                                style={{ color: walletConfig.labelColor }}
                              >
                                PASS-2025-HNT123456
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Helper text */}
                        <p className="text-[10px] text-white/30 text-center mt-4 leading-relaxed">
                          Vista previa de referencia
                          <br />
                          El diseño final se ajusta automáticamente en Apple
                          Wallet
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQs Section */}
        {activeTab === "faqs" && (
          <div className="space-y-4">
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">
                      Preguntas Frecuentes
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      Crea y gestiona las preguntas más comunes de tus
                      asistentes
                    </CardDescription>
                  </div>
                  {!isAddingFaq && !editingFaq && (
                    <Button
                      onClick={() => {
                        setIsAddingFaq(true);
                        setEditingFaq(null);
                        setNewQuestion("");
                        setNewAnswer("");
                      }}
                      className="rounded-full shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Pregunta
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add/Edit Form */}
                {(isAddingFaq || editingFaq) && (
                  <div className="p-6 rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                        {editingFaq ? "Editar Pregunta" : "Nueva Pregunta"}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="faq-question"
                          className="text-sm font-medium"
                        >
                          Pregunta
                        </Label>
                        <Input
                          id="faq-question"
                          value={editingFaq ? editingFaq.question : newQuestion}
                          onChange={(e) => {
                            if (editingFaq) {
                              setEditingFaq({
                                ...editingFaq,
                                question: e.target.value,
                              });
                            } else {
                              setNewQuestion(e.target.value);
                            }
                          }}
                          placeholder="Ej: ¿Cómo puedo obtener mi ticket?"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="faq-answer"
                          className="text-sm font-medium"
                        >
                          Respuesta
                        </Label>
                        <Textarea
                          id="faq-answer"
                          value={editingFaq ? editingFaq.answer : newAnswer}
                          onChange={(e) => {
                            if (editingFaq) {
                              setEditingFaq({
                                ...editingFaq,
                                answer: e.target.value,
                              });
                            } else {
                              setNewAnswer(e.target.value);
                            }
                          }}
                          placeholder="Escribe una respuesta clara y concisa..."
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 focus:outline-none transition-colors min-h-[120px] resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingFaq(false);
                          setEditingFaq(null);
                          setNewQuestion("");
                          setNewAnswer("");
                        }}
                        className="rounded-lg border-white/10 hover:bg-white/10 hover:text-white"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          if (editingFaq) {
                            const updatedFaqs = faqs.map((faq) =>
                              faq.id === editingFaq.id ? editingFaq : faq
                            );
                            setFaqs(updatedFaqs);
                            saveFaqs(updatedFaqs); // Save to database
                            setEditingFaq(null);
                          } else {
                            if (newQuestion.trim() && newAnswer.trim()) {
                              const updatedFaqs = [
                                ...faqs,
                                {
                                  id: Date.now().toString(),
                                  question: newQuestion,
                                  answer: newAnswer,
                                },
                              ];
                              setFaqs(updatedFaqs);
                              saveFaqs(updatedFaqs); // Save to database
                              setNewQuestion("");
                              setNewAnswer("");
                              setIsAddingFaq(false);
                            }
                          }
                        }}
                        className="rounded-lg min-w-[100px] bg-white text-black hover:bg-white/90"
                        disabled={
                          editingFaq
                            ? !editingFaq.question.trim() ||
                              !editingFaq.answer.trim()
                            : !newQuestion.trim() || !newAnswer.trim()
                        }
                      >
                        {editingFaq ? "Actualizar" : "Agregar"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* FAQs List */}
                {faqs.length === 0 && !isAddingFaq && !editingFaq ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                      <HelpCircle className="h-8 w-8 text-gray-500 dark:text-white/40" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      No hay preguntas frecuentes
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-white/40 max-w-md mx-auto">
                      Crea preguntas frecuentes para ayudar a tus asistentes a
                      resolver sus dudas rápidamente
                    </p>
                  </div>
                ) : faqs.length > 0 ? (
                  <div className="space-y-0">
                    {faqs.map((faq, index) => (
                      <div key={faq.id} className="relative">
                        {/* Drop Indicator - appears above the item when dragging over it */}
                        {dragOverIndex === index &&
                          draggedFaqIndex !== index && (
                            <div className="absolute -top-[2px] left-0 right-0 h-[3px] bg-blue-500 rounded-full z-10" />
                          )}

                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`group relative p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200 mb-3 ${
                            draggedFaqIndex === index
                              ? "opacity-40 scale-[0.98] shadow-lg"
                              : "opacity-100 scale-100"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Drag Handle - only visible on hover */}
                            <div className="flex-shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-gray-500 dark:text-white/40 hover:text-white/70">
                              <GripVertical className="h-5 w-5" />
                            </div>

                            {/* Number Badge */}
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white/70 font-semibold text-sm transition-transform group-hover:scale-105">
                              {index + 1}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-2.5">
                              <h4 className="font-semibold text-white text-sm leading-snug pr-20">
                                {faq.question}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute top-5 right-5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFaq(faq);
                                  setIsAddingFaq(false);
                                }}
                                className="h-9 w-9 p-0 rounded-lg hover:bg-white/10 hover:text-white"
                                title="Editar pregunta"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm(
                                      "¿Estás seguro de eliminar esta pregunta?"
                                    )
                                  ) {
                                    const updatedFaqs = faqs.filter(
                                      (f) => f.id !== faq.id
                                    );
                                    setFaqs(updatedFaqs);
                                    saveFaqs(updatedFaqs); // Save to database
                                  }
                                }}
                                className="h-9 w-9 p-0 rounded-lg hover:bg-red-500/20 hover:text-red-400"
                                title="Eliminar pregunta"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Right Column - Instructions */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-4">
          {/* Instructions Card for Information Tab */}
          {activeTab === "information" && (
            <>
              <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-gray-600 dark:text-white/60" />
                    <div>
                      <CardTitle className="text-base">
                        Guía de Configuración
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Tips para completar la información
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Información básica
                        </p>
                        <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                          Asegúrate de incluir un nombre atractivo y una
                          descripción detallada del evento
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Banner del evento</p>
                        <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                          Usa una imagen de alta calidad (mínimo 1920x1080px)
                          para el banner principal
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Ubicación precisa</p>
                        <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                          Ingresa la dirección completa para que los asistentes
                          puedan encontrar el lugar fácilmente
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center text-xs font-bold">
                        4
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Fechas y horarios</p>
                        <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                          Verifica que las fechas de inicio y fin sean correctas
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      Recuerda guardar
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1">
                      Los cambios se guardarán automáticamente al hacer clic en
                      el botón &quot;Guardar Cambios&quot;
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Instructions for Wallet Tab */}
          {activeTab === "wallet" && (
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle className="text-base">Apple Wallet</CardTitle>
                    <CardDescription className="text-xs">
                      Personaliza las entradas digitales
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Colores y branding</p>
                      <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                        Personaliza los colores para que coincidan con la
                        identidad de tu evento
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Logo e imágenes</p>
                      <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                        Sube tu logo y las imágenes que aparecerán en el pase de
                        Apple Wallet
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions for FAQs Tab */}
          {activeTab === "faqs" && (
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle className="text-base">
                      Preguntas Frecuentes
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ayuda a tus asistentes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Preguntas comunes</p>
                      <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                        Incluye información sobre estacionamiento, edad mínima,
                        política de reembolsos, etc.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Orden y claridad</p>
                      <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                        Organiza las preguntas de más a menos importante y sé
                        claro en las respuestas
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  // Return based on mode
  if (showTabsOnly) {
    return tabsSection;
  }

  if (showContentOnly) {
    return contentSection;
  }

  // Default: show both
  return (
    <div className="space-y-4">
      {tabsSection}
      {contentSection}
    </div>
  );
}
