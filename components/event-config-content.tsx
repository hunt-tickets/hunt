"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEventTabs } from "@/contexts/event-tabs-context";
import { toast } from "@/lib/toast";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import { FormModalSelect } from "@/components/ui/form-modal-select";
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
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Image as ImageIcon,
  Calendar,
  Upload,
  Trash2,
  DollarSign,
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
  ShoppingCart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
} from "@/constants/event-categories";
import { EventConfigCheckoutTab } from "@/components/event-config-checkout-tab";

// Countries and Cities
// const COUNTRIES = [
//   { value: "CO", label: "Colombia" },
// ];

const CITIES_BY_COUNTRY: Record<string, Array<{ value: string; label: string }>> = {
  CO: [
    // Principales ciudades
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellín", label: "Medellín" },
    { value: "Cali", label: "Cali" },
    { value: "Barranquilla", label: "Barranquilla" },
    { value: "Cartagena", label: "Cartagena" },
    { value: "Bucaramanga", label: "Bucaramanga" },

    // Amazonas
    { value: "Leticia", label: "Leticia" },

    // Antioquia
    { value: "Apartadó", label: "Apartadó" },
    { value: "Bello", label: "Bello" },
    { value: "Caucasia", label: "Caucasia" },
    { value: "Envigado", label: "Envigado" },
    { value: "Itagüí", label: "Itagüí" },
    { value: "Rionegro", label: "Rionegro" },
    { value: "Turbo", label: "Turbo" },

    // Arauca
    { value: "Arauca", label: "Arauca" },

    // Atlántico
    { value: "Malambo", label: "Malambo" },
    { value: "Sabanalarga", label: "Sabanalarga" },
    { value: "Soledad", label: "Soledad" },

    // Bolívar
    { value: "Magangué", label: "Magangué" },

    // Boyacá
    { value: "Duitama", label: "Duitama" },
    { value: "Sogamoso", label: "Sogamoso" },
    { value: "Tunja", label: "Tunja" },

    // Caldas
    { value: "Manizales", label: "Manizales" },

    // Caquetá
    { value: "Florencia", label: "Florencia" },

    // Casanare
    { value: "Yopal", label: "Yopal" },

    // Cauca
    { value: "Popayán", label: "Popayán" },

    // Cesar
    { value: "Aguachica", label: "Aguachica" },
    { value: "Valledupar", label: "Valledupar" },

    // Chocó
    { value: "Quibdó", label: "Quibdó" },

    // Córdoba
    { value: "Cereté", label: "Cereté" },
    { value: "Lorica", label: "Lorica" },
    { value: "Montería", label: "Montería" },
    { value: "Sahagún", label: "Sahagún" },

    // Cundinamarca
    { value: "Chía", label: "Chía" },
    { value: "Facatativá", label: "Facatativá" },
    { value: "Fusagasugá", label: "Fusagasugá" },
    { value: "Girardot", label: "Girardot" },
    { value: "Madrid", label: "Madrid" },
    { value: "Mosquera", label: "Mosquera" },
    { value: "Soacha", label: "Soacha" },
    { value: "Zipaquirá", label: "Zipaquirá" },

    // Guainía
    { value: "Inírida", label: "Inírida" },

    // Guaviare
    { value: "San José del Guaviare", label: "San José del Guaviare" },

    // Huila
    { value: "Neiva", label: "Neiva" },
    { value: "Pitalito", label: "Pitalito" },

    // La Guajira
    { value: "Maicao", label: "Maicao" },
    { value: "Riohacha", label: "Riohacha" },

    // Magdalena
    { value: "Ciénaga", label: "Ciénaga" },
    { value: "Santa Marta", label: "Santa Marta" },

    // Meta
    { value: "Acacías", label: "Acacías" },
    { value: "Villavicencio", label: "Villavicencio" },

    // Nariño
    { value: "Ipiales", label: "Ipiales" },
    { value: "Pasto", label: "Pasto" },
    { value: "Tumaco", label: "Tumaco" },

    // Norte de Santander
    { value: "Cúcuta", label: "Cúcuta" },
    { value: "Los Patios", label: "Los Patios" },
    { value: "Ocaña", label: "Ocaña" },
    { value: "Villa del Rosario", label: "Villa del Rosario" },

    // Putumayo
    { value: "Mocoa", label: "Mocoa" },

    // Quindío
    { value: "Armenia", label: "Armenia" },
    { value: "Calarcá", label: "Calarcá" },

    // Risaralda
    { value: "Dosquebradas", label: "Dosquebradas" },
    { value: "Pereira", label: "Pereira" },
    { value: "Santa Rosa de Cabal", label: "Santa Rosa de Cabal" },

    // San Andrés y Providencia
    { value: "San Andrés", label: "San Andrés" },

    // Santander
    { value: "Barrancabermeja", label: "Barrancabermeja" },
    { value: "Floridablanca", label: "Floridablanca" },
    { value: "Girón", label: "Girón" },
    { value: "Piedecuesta", label: "Piedecuesta" },

    // Sucre
    { value: "Sincelejo", label: "Sincelejo" },

    // Tolima
    { value: "Espinal", label: "Espinal" },
    { value: "Ibagué", label: "Ibagué" },

    // Valle del Cauca
    { value: "Buenaventura", label: "Buenaventura" },
    { value: "Buga", label: "Buga" },
    { value: "Cartago", label: "Cartago" },
    { value: "Jamundí", label: "Jamundí" },
    { value: "Palmira", label: "Palmira" },
    { value: "Tuluá", label: "Tuluá" },
    { value: "Yumbo", label: "Yumbo" },

    // Vaupés
    { value: "Mitú", label: "Mitú" },

    // Vichada
    { value: "Puerto Carreño", label: "Puerto Carreño" },
  ],
};

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
  // private_list?: boolean; // TODO: Waiting for DB migration
  faqs?: Array<{ id: string; question: string; answer: string }>;
  checkout_questions?: Array<{
    id: string;
    question: string;
    type: "text" | "select" | "multiselect" | "textarea";
    required: boolean;
    scope: "per_order" | "per_ticket";
    ticket_type_ids: string[];
    options: string[];
    placeholder: string;
    sort_order: number;
  }>;
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
    country: "CO", // Default to Colombia
    address: "",
    startDate: "",
    endDate: "",
    age: 18,
    timezone: "America/Bogota",
    currency: "COP",
    isPrivate: false,
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
        isPrivate: false, // TODO: Waiting for DB migration to add private_list field
      });

      // Initialize images if available
      if (eventData.flyer) {
        setImages((prev) => ({ ...prev, banner: eventData.flyer || null }));
      }

      // Initialize FAQs if available
      if (eventData.faqs && Array.isArray(eventData.faqs)) {
        setFaqs(eventData.faqs);
      }

      // Initialize Checkout Questions if available
      if (eventData.checkout_questions && Array.isArray(eventData.checkout_questions)) {
        setCheckoutQuestions(eventData.checkout_questions);
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

  // Checkout Questions State
  interface CheckoutQuestion {
    id: string;
    question: string;
    type: "text" | "select" | "multiselect" | "textarea";
    required: boolean;
    scope: "per_order" | "per_ticket";
    ticket_type_ids: string[];
    options: string[];
    placeholder: string;
    sort_order: number;
  }

  const [checkoutQuestions, setCheckoutQuestions] = useState<CheckoutQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<CheckoutQuestion | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState<number | null>(null);
  const [dragOverQuestionIndex, setDragOverQuestionIndex] = useState<number | null>(null);

  const tabs = [
    { id: "information", label: "Información", icon: Settings },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
    { id: "checkout", label: "Checkout", icon: ShoppingCart },
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
          // private_list: formData.isPrivate, // TODO: Waiting for DB migration
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

  // Checkout Questions Functions
  const saveCheckoutQuestions = async (updatedQuestions: CheckoutQuestion[]) => {
    if (!eventId) return;

    try {
      const { updateEventConfiguration } = await import("@/actions/events");

      const result = await updateEventConfiguration(eventId, {
        checkout_questions: updatedQuestions,
      });

      if (!result.success) {
        console.error("Error al guardar preguntas de checkout:", result.message);
      }
    } catch (error) {
      console.error("Error saving checkout questions:", error);
    }
  };

  const handleQuestionDragStart = (e: React.DragEvent, index: number) => {
    setDraggedQuestionIndex(index);
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleQuestionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedQuestionIndex !== null && draggedQuestionIndex !== index) {
      setDragOverQuestionIndex(index);
    }
  };

  const handleQuestionDragLeave = () => {
    setDragOverQuestionIndex(null);
  };

  const handleQuestionDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedQuestionIndex === null || draggedQuestionIndex === dropIndex) {
      setDraggedQuestionIndex(null);
      setDragOverQuestionIndex(null);
      return;
    }

    const newQuestions = [...checkoutQuestions];
    const draggedItem = newQuestions[draggedQuestionIndex];

    // Remove from old position
    newQuestions.splice(draggedQuestionIndex, 1);

    // Insert at new position
    newQuestions.splice(dropIndex, 0, draggedItem);

    // Update sort_order
    const updatedQuestions = newQuestions.map((q, idx) => ({
      ...q,
      sort_order: idx,
    }));

    setCheckoutQuestions(updatedQuestions);
    saveCheckoutQuestions(updatedQuestions);
    setDraggedQuestionIndex(null);
    setDragOverQuestionIndex(null);
  };

  const handleQuestionDragEnd = () => {
    setDraggedQuestionIndex(null);
    setDragOverQuestionIndex(null);
  };

  const deleteCheckoutQuestion = (id: string) => {
    const updatedQuestions = checkoutQuestions.filter((q) => q.id !== id);
    setCheckoutQuestions(updatedQuestions);
    saveCheckoutQuestions(updatedQuestions);
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
  const contentSection = activeTab === "checkout" ? (
    // Full width layout for Checkout tab
    <div className="space-y-4">
      {/* Checkout Questions Tab */}
      {activeTab === "checkout" && (
        <EventConfigCheckoutTab
          checkoutQuestions={checkoutQuestions}
          isAddingQuestion={isAddingQuestion}
          editingQuestion={editingQuestion}
          draggedQuestionIndex={draggedQuestionIndex}
          dragOverQuestionIndex={dragOverQuestionIndex}
          setIsAddingQuestion={setIsAddingQuestion}
          setEditingQuestion={setEditingQuestion}
          handleQuestionDragStart={handleQuestionDragStart}
          handleQuestionDragOver={handleQuestionDragOver}
          handleQuestionDragLeave={handleQuestionDragLeave}
          handleQuestionDrop={handleQuestionDrop}
          handleQuestionDragEnd={handleQuestionDragEnd}
          deleteCheckoutQuestion={deleteCheckoutQuestion}
        />
      )}
    </div>
  ) : (
    // Two-column layout for Information and FAQs tabs
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
                    <CardDescription className="text-gray-500 dark:text-gray-400">
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
                <FormModalSelect
                  id="category"
                  name="category"
                  label="Categoría"
                  value={formData.category || ""}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value as (typeof EVENT_CATEGORIES)[number],
                    }))
                  }
                  options={EVENT_CATEGORIES.map((cat) => ({
                    value: cat,
                    label: EVENT_CATEGORY_LABELS[cat],
                  }))}
                  placeholder="Selecciona una categoría"
                  hint="La categoría ayuda a que tu evento aparezca en búsquedas y filtros, aumentando su visibilidad"
                  required
                />

                {/* Age Restriction */}
                <FormModalSelect
                  id="age"
                  name="age"
                  label="Edad Mínima"
                  value={formData.age || 0}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      age: parseInt(value),
                    }))
                  }
                  options={[
                    { value: "0", label: "Para todo público" },
                    { value: "12", label: "12+" },
                    { value: "18", label: "18+" },
                    { value: "21", label: "21+" },
                    { value: "25", label: "25+" },
                  ]}
                  hint="Edad mínima requerida para asistir al evento"
                />

                {/* Private Event */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525] transition-colors">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="isPrivate" className="text-sm font-medium cursor-pointer">
                        Evento Privado
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-white/40">
                        Los eventos privados no aparecen en búsquedas públicas
                      </p>
                    </div>
                    <Switch
                      id="isPrivate"
                      checked={formData.isPrivate}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          isPrivate: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle>Ubicación</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
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

                {/* Country and City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Country - Fixed to Colombia */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">País</Label>
                    <div className="flex items-center p-4 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] opacity-60 cursor-not-allowed">
                      <Globe className="h-4 w-4 mr-3 text-gray-500 dark:text-white/40" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Colombia
                      </span>
                    </div>
                  </div>

                  {/* City Select */}
                  <FormModalSelect
                    label="Ciudad"
                    value={formData.city}
                    onChange={(value) =>
                      setFormData({ ...formData, city: value })
                    }
                    options={CITIES_BY_COUNTRY["CO"] || []}
                    placeholder="Selecciona una ciudad"
                    searchable={true}
                    searchPlaceholder="Buscar ciudad..."
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
                    <CardDescription className="text-gray-500 dark:text-gray-400">
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
                    <CardDescription className="text-gray-500 dark:text-gray-400">
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
                <FormModalSelect
                  id="timezone"
                  name="timezone"
                  label="Zona Horaria"
                  icon={<Globe className="h-4 w-4" />}
                  value={formData.timezone || "America/Bogota"}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      timezone: value,
                    }))
                  }
                  options={[
                    { value: "America/Bogota", label: "Colombia (GMT-5)" },
                    { value: "America/Mexico_City", label: "México (GMT-6)" },
                    { value: "America/New_York", label: "New York (GMT-5)" },
                    { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
                    { value: "America/Chicago", label: "Chicago (GMT-6)" },
                    { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
                    { value: "America/Santiago", label: "Santiago (GMT-4)" },
                    { value: "America/Lima", label: "Lima (GMT-5)" },
                    { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
                    { value: "Europe/London", label: "London (GMT+0)" },
                    { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
                  ]}
                  hint="Las fechas y horas se mostrarán según esta zona horaria"
                />
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle>Configuración Regional</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Moneda y formato de precios
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Moneda
                  </Label>
                  <div className="flex items-center p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] opacity-60 cursor-not-allowed">
                    <DollarSign className="h-4 w-4 text-gray-500 dark:text-white/40 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      COP - Peso Colombiano
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/40">
                    Todos los precios se mostrarán en esta moneda
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Banner Image */}
            <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-gray-600 dark:text-white/60" />
                  <div>
                    <CardTitle>Flyer del Evento</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Imagen principal del evento (formato póster vertical)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-white/50">
                  Recomendado: 900x1200px (ratio 3:4), máximo 5MB
                </p>

                {images.banner ? (
                  <div className="relative aspect-[3/4] max-w-xs rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
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
                  <label className="flex flex-col items-center justify-center aspect-[3/4] max-w-xs border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
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
                  <div className="p-6 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white/80 uppercase tracking-wider">
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
                        <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
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
                            className="h-6 w-full bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-none text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="faq-answer"
                          className="text-sm font-medium"
                        >
                          Respuesta
                        </Label>
                        <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
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
                            className="w-full bg-transparent border-none focus-visible:ring-0 text-sm font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-none min-h-[120px] resize-none !text-gray-900 dark:!text-white p-0"
                          />
                        </div>
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
                        className="rounded-lg border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10"
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
                        className="rounded-lg min-w-[100px] bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white/90"
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 mb-4">
                      <HelpCircle className="h-8 w-8 text-gray-500 dark:text-white/40" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
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
                            <div className="absolute -top-[2px] left-0 right-0 h-[3px] bg-gray-900 dark:bg-white rounded-full z-10" />
                          )}

                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`group relative p-5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all duration-200 mb-3 ${
                            draggedFaqIndex === index
                              ? "opacity-40 scale-[0.98] shadow-lg"
                              : "opacity-100 scale-100"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Drag Handle - only visible on hover */}
                            <div className="flex-shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70">
                              <GripVertical className="h-5 w-5" />
                            </div>

                            {/* Number Badge */}
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white/70 font-semibold text-sm transition-transform group-hover:scale-105">
                              {index + 1}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-2.5">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug pr-20">
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
                                className="h-9 w-9 p-0 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
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
                      <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
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
