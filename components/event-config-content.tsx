"use client";

import { useState, useEffect } from "react";
import { useEventTabs } from "@/contexts/event-tabs-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Image as ImageIcon,
  MapPin,
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
} from "lucide-react";

interface EventData {
  id: string;
  name: string;
  description?: string;
  date?: string;
  end_date?: string;
  age?: number;
  variable_fee?: number;
  fixed_fee?: number;
  flyer?: string;
  flyer_apple?: string;
  venue_id?: string;
  faqs?: Array<{ id: string; question: string; answer: string }>;
  venues?: {
    id: string;
    name: string;
    address?: string;
    city?: string;
  };
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
  const { configTab: activeTab, setConfigTab: setActiveTab } = useEventTabs();
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    location: "",
    city: "",
    country: "",
    startDate: "",
    endDate: "",
    age: 18,
    timezone: "America/Bogota",
    currency: "COP",
  });

  const [isSaving, setIsSaving] = useState(false);

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
        location: eventData.venues?.address || "",
        city: eventData.venues?.city || "",
        country: "",
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
      const { updateEventConfiguration } = await import(
        "@/lib/supabase/actions/events"
      );

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
        const { updateEventConfiguration } = await import(
          "@/lib/supabase/actions/events"
        );

        const result = await updateEventConfiguration(eventId, {
          name: formData.eventName,
          description: formData.description,
          date: formData.startDate,
          end_date: formData.endDate,
          age: formData.age,
          variable_fee: huntCosts.commissionPercentage / 100,
          fixed_fee: huntCosts.costPerTicket,
        });

        if (result.success) {
          alert("Configuración guardada exitosamente");
        } else {
          alert(result.message || "Error al guardar la configuración");
        }
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      alert("Error al guardar la configuración");
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
                ? "bg-white/10 text-white border border-white/20"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
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
    <div className="space-y-4">
      {/* Information Section */}
      {activeTab === "information" && (
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-white/60" />
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
              <div className="space-y-2">
                <Label htmlFor="eventName" className="text-sm font-medium">
                  Nombre del Evento
                </Label>
                <Input
                  id="eventName"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="ej. Festival de Música 2024"
                  className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe tu evento, artistas, atracciones y todo lo que los asistentes deben saber..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors min-h-[140px] resize-none"
                />
                <p className="text-xs text-white/40">
                  Esta descripción será visible para todos los usuarios
                </p>
              </div>

              {/* Age Restriction */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  Edad Mínima
                </Label>
                <select
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      age: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors"
                >
                  <option value="0">Para todo público</option>
                  <option value="12">12+</option>
                  <option value="18">18+</option>
                  <option value="21">21+</option>
                  <option value="25">25+</option>
                </select>
                <p className="text-xs text-white/40">
                  Edad mínima requerida para asistir al evento
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPinned className="h-5 w-5 text-white/60" />
                <div>
                  <CardTitle>Ubicación</CardTitle>
                  <CardDescription>
                    Dónde se llevará a cabo el evento
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Full Address */}
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-white/40" />
                  Dirección
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="ej. Av. Principal 123, Auditorio Nacional"
                  className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* City and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    Ciudad
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="ej. Bogotá"
                    className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    País
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="ej. Colombia"
                    className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time Configuration */}
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-white/60" />
                <div>
                  <CardTitle>Fecha y Hora</CardTitle>
                  <CardDescription>
                    Cuándo se realizará el evento
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Fecha y Hora de Inicio
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    Fecha y Hora de Fin
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label
                  htmlFor="timezone"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-white/40" />
                  Zona Horaria
                </Label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timezone: e.target.value,
                    }))
                  }
                  className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors"
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
                </select>
                <p className="text-xs text-white/40">
                  Las fechas y horas se mostrarán según esta zona horaria
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-white/60" />
                <div>
                  <CardTitle>Configuración Regional</CardTitle>
                  <CardDescription>Moneda y formato de precios</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="currency"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4 text-white/40" />
                  Moneda
                </Label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors"
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
                </select>
                <p className="text-xs text-white/40">
                  Todos los precios se mostrarán en esta moneda
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Banner Image */}
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-white/60" />
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
                    <Upload className="h-8 w-8 text-white/40 mb-2" />
                    <p className="text-sm text-white/60 text-center px-4">
                      Haz clic o arrastra una imagen
                    </p>
                    <p className="text-xs text-white/40 mt-1">
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
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader>
            <CardTitle>Diseño de Apple Wallet</CardTitle>
            <CardDescription>
              Personaliza cómo se verán tus tickets en Apple Wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Inputs */}
              <div className="space-y-6">
                {/* Color Configuration */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Colores</Label>

                  {/* All 3 colors in one row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Background Color */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="backgroundColor"
                        className="text-xs text-white/60"
                      >
                        Fondo
                      </Label>
                      <div className="relative">
                        <Input
                          id="backgroundColor"
                          name="backgroundColor"
                          type="color"
                          value={walletConfig.backgroundColor}
                          onChange={handleWalletColorChange}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <div
                            className="w-5 h-5 rounded border border-white/20"
                            style={{
                              backgroundColor: walletConfig.backgroundColor,
                            }}
                          />
                          <span className="text-xs font-mono text-white/80 uppercase">
                            {walletConfig.backgroundColor}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Foreground Color */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="foregroundColor"
                        className="text-xs text-white/60"
                      >
                        Texto
                      </Label>
                      <div className="relative">
                        <Input
                          id="foregroundColor"
                          name="foregroundColor"
                          type="color"
                          value={walletConfig.foregroundColor}
                          onChange={handleWalletColorChange}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <div
                            className="w-5 h-5 rounded border border-white/20"
                            style={{
                              backgroundColor: walletConfig.foregroundColor,
                            }}
                          />
                          <span className="text-xs font-mono text-white/80 uppercase">
                            {walletConfig.foregroundColor}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Label Color */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="labelColor"
                        className="text-xs text-white/60"
                      >
                        Etiquetas
                      </Label>
                      <div className="relative">
                        <Input
                          id="labelColor"
                          name="labelColor"
                          type="color"
                          value={walletConfig.labelColor}
                          onChange={handleWalletColorChange}
                          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <div
                            className="w-5 h-5 rounded border border-white/20"
                            style={{ backgroundColor: walletConfig.labelColor }}
                          />
                          <span className="text-xs font-mono text-white/80 uppercase">
                            {walletConfig.labelColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Imágenes</Label>

                  {/* Strip Image */}
                  <div className="space-y-3">
                    <Label>Imagen Strip</Label>
                    <p className="text-xs text-white/50">
                      Recomendado: 375x123px (franja superior)
                    </p>

                    {walletConfig.strip ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                        <img
                          src={walletConfig.strip as string}
                          alt="Strip Image"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setWalletConfig((prev) => ({
                              ...prev,
                              strip: null,
                            }))
                          }
                          className="absolute top-2 right-2 rounded-lg h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="h-6 w-6 text-white/40 mb-1" />
                          <p className="text-xs text-white/60">Subir Strip</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleWalletImageUpload(e, "strip")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Logo and Icon in same row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Logo */}
                    <div className="space-y-3">
                      <div>
                        <Label>Logo</Label>
                        <p className="text-xs text-white/50">
                          Recomendado: 160x50px
                        </p>
                      </div>

                      {walletConfig.logo ? (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                          <img
                            src={walletConfig.logo as string}
                            alt="Wallet Logo"
                            className="max-w-full max-h-full object-contain"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setWalletConfig((prev) => ({
                                ...prev,
                                logo: null,
                              }))
                            }
                            className="absolute top-2 right-2 rounded-lg h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="h-6 w-6 text-white/40 mb-1" />
                            <p className="text-xs text-white/60">Subir Logo</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleWalletImageUpload(e, "logo")}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="space-y-3">
                      <div>
                        <Label>Ícono</Label>
                        <p className="text-xs text-white/50">
                          Recomendado: 58x58px
                        </p>
                      </div>

                      {walletConfig.icon ? (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                          <img
                            src={walletConfig.icon as string}
                            alt="Wallet Icon"
                            className="max-w-full max-h-full object-contain"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setWalletConfig((prev) => ({
                                ...prev,
                                icon: null,
                              }))
                            }
                            className="absolute top-2 right-2 rounded-lg h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="h-5 w-5 text-white/40 mb-1" />
                            <p className="text-xs text-white/60 text-center px-2">
                              Subir Ícono
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleWalletImageUpload(e, "icon")}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-white/10">
                  <Button
                    onClick={() => handleSaveConfig("wallet")}
                    className="w-full rounded-lg"
                  >
                    Guardar Diseño de Wallet
                  </Button>
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Vista Previa</Label>
                <div className="sticky top-6">
                  {/* Apple Wallet Pass Preview - Simple */}
                  <div className="max-w-[375px] mx-auto">
                    <div
                      className="relative rounded-xl overflow-hidden shadow-xl border border-white/10"
                      style={{ backgroundColor: walletConfig.backgroundColor }}
                    >
                      {/* Strip Image Area */}
                      {walletConfig.strip ? (
                        <div className="w-full h-32 overflow-hidden relative">
                          <img
                            src={walletConfig.strip as string}
                            alt="Strip"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-white/5 to-white/10" />
                      )}

                      {/* Content */}
                      <div className="p-6">
                        {/* Logo */}
                        <div className="mb-6">
                          {walletConfig.logo ? (
                            <img
                              src={walletConfig.logo as string}
                              alt="Logo"
                              className="max-h-12 max-w-[200px] object-contain"
                            />
                          ) : (
                            <div
                              className="text-sm font-semibold"
                              style={{ color: walletConfig.foregroundColor }}
                            >
                              Logo del Evento
                            </div>
                          )}
                        </div>

                        {/* Event Name */}
                        <div className="mb-6">
                          <div
                            className="text-xs uppercase tracking-wider mb-1 opacity-60"
                            style={{ color: walletConfig.labelColor }}
                          >
                            EVENTO
                          </div>
                          <div
                            className="text-2xl font-bold"
                            style={{ color: walletConfig.foregroundColor }}
                          >
                            Nombre del Evento
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center pt-4 pb-2">
                          <div className="bg-white rounded-lg p-4">
                            <svg width="120" height="120" viewBox="0 0 120 120">
                              <rect width="120" height="120" fill="white" />
                              <rect
                                x="10"
                                y="10"
                                width="30"
                                height="30"
                                fill="black"
                              />
                              <rect
                                x="15"
                                y="15"
                                width="20"
                                height="20"
                                fill="white"
                              />
                              <rect
                                x="20"
                                y="20"
                                width="10"
                                height="10"
                                fill="black"
                              />
                              <rect
                                x="80"
                                y="10"
                                width="30"
                                height="30"
                                fill="black"
                              />
                              <rect
                                x="85"
                                y="15"
                                width="20"
                                height="20"
                                fill="white"
                              />
                              <rect
                                x="90"
                                y="20"
                                width="10"
                                height="10"
                                fill="black"
                              />
                              <rect
                                x="10"
                                y="80"
                                width="30"
                                height="30"
                                fill="black"
                              />
                              <rect
                                x="15"
                                y="85"
                                width="20"
                                height="20"
                                fill="white"
                              />
                              <rect
                                x="20"
                                y="90"
                                width="10"
                                height="10"
                                fill="black"
                              />
                              {Array.from({ length: 80 }).map((_, i) => {
                                const x = 10 + (i % 10) * 10;
                                const y = 50 + Math.floor(i / 10) * 10;
                                return Math.random() > 0.5 ? (
                                  <rect
                                    key={i}
                                    x={x}
                                    y={y}
                                    width="8"
                                    height="8"
                                    fill="black"
                                  />
                                ) : null;
                              })}
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Helper text */}
                    <p className="text-xs text-white/40 text-center mt-4">
                      Vista previa simplificada • Los detalles se generarán
                      automáticamente
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQs Section */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">
                    Preguntas Frecuentes
                  </CardTitle>
                  <CardDescription className="mt-1.5">
                    Crea y gestiona las preguntas más comunes de tus asistentes
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
                        className="w-full h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors"
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
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-base focus:border-white/20 focus:outline-none transition-colors min-h-[120px] resize-none"
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
                    <HelpCircle className="h-8 w-8 text-white/40" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    No hay preguntas frecuentes
                  </h3>
                  <p className="text-sm text-white/40 max-w-md mx-auto">
                    Crea preguntas frecuentes para ayudar a tus asistentes a
                    resolver sus dudas rápidamente
                  </p>
                </div>
              ) : faqs.length > 0 ? (
                <div className="space-y-0">
                  {faqs.map((faq, index) => (
                    <div key={faq.id} className="relative">
                      {/* Drop Indicator - appears above the item when dragging over it */}
                      {dragOverIndex === index && draggedFaqIndex !== index && (
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
                          <div className="flex-shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-white/40 hover:text-white/70">
                            <GripVertical className="h-5 w-5" />
                          </div>

                          {/* Number Badge */}
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white/70 font-semibold text-sm transition-transform group-hover:scale-105">
                            {index + 1}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-2.5">
                            <h4 className="font-semibold text-white text-base leading-snug pr-20">
                              {faq.question}
                            </h4>
                            <p className="text-sm text-white/60 leading-relaxed">
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
