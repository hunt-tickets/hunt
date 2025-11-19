"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";

interface Section {
  id: string;
  name: string;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  price: number;
  color: string;
  capacity: number;
}

interface VenueCircularEditorProps {
  eventId: string;
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#06b6d4",
];

export function VenueCircularEditor({ eventId }: VenueCircularEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [stageRadius, setStageRadius] = useState(80);
  const [canvasCenter, setCanvasCenter] = useState({ x: 0, y: 0 });

  // eventId is used for saving/loading venue layouts from database
  const handleSaveLayout = () => {
    // TODO: Implement save layout to database using eventId
    console.log("Saving layout for event:", eventId);
  };

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width;
    canvas.height = height;

    setCanvasCenter({
      x: width / 2,
      y: height / 2,
    });
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvasCenter.x || canvas.width / 2;
    const centerY = canvasCenter.y || canvas.height / 2;

    // Background
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sections
    sections.forEach((section) => {
      const startRad = (section.startAngle * Math.PI) / 180;
      const endRad = (section.endAngle * Math.PI) / 180;

      // Draw sector
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        section.outerRadius,
        startRad,
        endRad
      );
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle =
        selectedSection === section.id
          ? section.color + "dd"
          : section.color + "99";
      ctx.fill();

      // Border
      ctx.strokeStyle =
        selectedSection === section.id ? section.color : section.color + "66";
      ctx.lineWidth = selectedSection === section.id ? 3 : 2;
      ctx.stroke();

      // Inner ring border
      ctx.beginPath();
      ctx.arc(centerX, centerY, section.innerRadius, startRad, endRad);
      ctx.stroke();

      // Label
      const midAngle = (startRad + endRad) / 2;
      const labelRadius = (section.innerRadius + section.outerRadius) / 2;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);

      ctx.save();
      ctx.translate(labelX, labelY);
      ctx.rotate(midAngle);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Arial";
      ctx.fillText(section.name, 0, 0);
      ctx.font = "11px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`$${section.price}`, 0, 16);
      ctx.restore();
    });

    // Draw stage
    ctx.beginPath();
    ctx.arc(centerX, centerY, stageRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(148, 51, 234, 0.2)";
    ctx.fill();
    ctx.strokeStyle = "rgba(168, 85, 247, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#a855f7";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PALCO", centerX, centerY);
  }, [sections, selectedSection, stageRadius, canvasCenter]);

  const handleAddSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      name: `Sección ${sections.length + 1}`,
      startAngle: 0,
      endAngle: 60,
      innerRadius: stageRadius + 30,
      outerRadius: stageRadius + 120,
      price: 50000,
      color: COLORS[sections.length % COLORS.length],
      capacity: 100,
    };

    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvasCenter.x;
    const y = e.clientY - rect.top - canvasCenter.y;

    const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    const distance = Math.sqrt(x * x + y * y);

    // Find clicked section
    for (const section of sections) {
      if (
        distance >= section.innerRadius &&
        distance <= section.outerRadius &&
        angle >= section.startAngle &&
        angle <= section.endAngle
      ) {
        setSelectedSection(section.id);
        return;
      }
    }

    setSelectedSection(null);
  };

  const updateSection = (id: string, key: keyof Section, value: string | number) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
    if (selectedSection === id) {
      setSelectedSection(null);
    }
  };

  const selectedData = sections.find((s) => s.id === selectedSection);
  const totalCapacity = sections.reduce((sum, s) => sum + s.capacity, 0);
  const totalRevenue = sections.reduce((sum, s) => sum + s.price * s.capacity, 0);

  return (
    <div className="flex gap-4 h-screen bg-[#0f0f0f] p-4">
      {/* Left Sidebar */}
      <div className="w-72 flex flex-col gap-4">
        {/* Stats */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/50 mb-1">Capacidad Total</p>
                <p className="text-2xl font-bold">{totalCapacity}</p>
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-white/50 mb-1">Ingresos Potenciales</p>
                <p className="text-lg font-bold">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Palco */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="pt-4">
            <label className="text-sm font-medium block mb-2">Radio del Palco</label>
            <Input
              type="number"
              value={stageRadius}
              onChange={(e) => setStageRadius(parseInt(e.target.value) || 50)}
              min="20"
              max="200"
              className="h-9 rounded-lg bg-white/5 border-white/10"
            />
          </CardContent>
        </Card>

        {/* Add Section */}
        <Button
          onClick={handleAddSection}
          className="w-full rounded-lg justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Sección
        </Button>

        {/* Sections List */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          <h3 className="text-sm font-semibold text-white/80">
            Secciones ({sections.length})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {sections.map((section) => (
              <div
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedSection === section.id
                    ? "bg-white/10 border-white/20"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: section.color }}
                  />
                  <span className="text-sm font-medium truncate">
                    {section.name}
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  ${section.price.toLocaleString()} × {section.capacity} = $
                  {(section.price * section.capacity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Properties */}
        {selectedData && (
          <Card className="bg-white/[0.02] border-white/5">
            <CardContent className="pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-white/80">Propiedades</h3>

              <div>
                <label className="text-xs text-white/60 block mb-1">Nombre</label>
                <Input
                  value={selectedData.name}
                  onChange={(e) =>
                    updateSection(selectedData.id, "name", e.target.value)
                  }
                  className="h-9 rounded-lg bg-white/5 border-white/10 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 block mb-1">Precio</label>
                <Input
                  type="number"
                  value={selectedData.price}
                  onChange={(e) =>
                    updateSection(
                      selectedData.id,
                      "price",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="h-9 rounded-lg bg-white/5 border-white/10 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-white/60 block mb-1">Capacidad</label>
                <Input
                  type="number"
                  value={selectedData.capacity}
                  onChange={(e) =>
                    updateSection(
                      selectedData.id,
                      "capacity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="h-9 rounded-lg bg-white/5 border-white/10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/60 block mb-1">
                    Ángulo Inicio
                  </label>
                  <Input
                    type="number"
                    value={selectedData.startAngle}
                    onChange={(e) =>
                      updateSection(
                        selectedData.id,
                        "startAngle",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="h-9 rounded-lg bg-white/5 border-white/10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 block mb-1">
                    Ángulo Fin
                  </label>
                  <Input
                    type="number"
                    value={selectedData.endAngle}
                    onChange={(e) =>
                      updateSection(
                        selectedData.id,
                        "endAngle",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="h-9 rounded-lg bg-white/5 border-white/10 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-white/60 block mb-1">
                    Radio Interno
                  </label>
                  <Input
                    type="number"
                    value={selectedData.innerRadius}
                    onChange={(e) =>
                      updateSection(
                        selectedData.id,
                        "innerRadius",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="h-9 rounded-lg bg-white/5 border-white/10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 block mb-1">
                    Radio Externo
                  </label>
                  <Input
                    type="number"
                    value={selectedData.outerRadius}
                    onChange={(e) =>
                      updateSection(
                        selectedData.id,
                        "outerRadius",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="h-9 rounded-lg bg-white/5 border-white/10 text-sm"
                  />
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteSection(selectedData.id)}
                className="w-full rounded-lg"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Top Bar */}
        <div className="h-12 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between px-4">
          <h2 className="font-semibold">Editor de Venue Circular</h2>
          <Button size="sm" className="rounded-lg" onClick={handleSaveLayout}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Layout
          </Button>
        </div>

        {/* Canvas */}
        <div className="flex-1 rounded-lg border border-white/5 overflow-hidden bg-black/20">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
