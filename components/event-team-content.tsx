"use client";

import { useState, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GripVertical, Edit2, Plus, X, Lock, UserCog, Music } from "lucide-react";
import { AddProducerDialog } from "@/components/add-producer-dialog";
import { AddArtistDialog } from "@/components/add-artist-dialog";
import { Input } from "@/components/ui/input";
import { useEventTabs } from "@/contexts/event-tabs-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Producer {
  id: string;
  created_at: string;
  producer: {
    id: string;
    name: string | null;
    logo: string | null;
  };
}

interface AllProducer {
  id: string;
  name: string | null;
  logo: string | null;
}

interface Artist {
  id: string;
  created_at: string;
  artist: {
    id: string;
    name: string | null;
    description: string | null;
    category: string | null;
    logo: string | null;
  };
}

interface AllArtist {
  id: string;
  name: string | null;
  description: string | null;
  category: string | null;
  logo: string | null;
}

interface EventTeamContentProps {
  eventId: string;
  producers: Producer[];
  artists: Artist[];
  allProducers: AllProducer[];
  allArtists: AllArtist[];
  eventStartDate: string;
  eventEndDate: string;
  showTabsOnly?: boolean;
  showContentOnly?: boolean;
}

interface ScheduleSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  artistId: string;
  artistName: string;
  artistLogo: string | null;
  stageId: string;
}

interface EventDay {
  date: string;
  dayName: string;
  shortDate: string;
  timeSlots: string[];
}

interface Stage {
  id: string;
  name: string;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Generate time slots (hours only for display)
function generateTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

// Generate detailed time slots with 15-minute intervals (for editing)
function generateDetailedTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < endHour) {
      slots.push(`${String(h).padStart(2, '0')}:15`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
      slots.push(`${String(h).padStart(2, '0')}:45`);
    }
  }
  return slots;
}

// Convert 24h format to 12h format
function formatTo12Hour(time24: string): string {
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr);
  const minute = minuteStr || '00';

  if (hour === 0) return `12:${minute} AM`;
  if (hour < 12) return `${hour}:${minute} AM`;
  if (hour === 12) return `12:${minute} PM`;
  return `${hour - 12}:${minute} PM`;
}

export function EventTeamContent({
  eventId,
  producers,
  artists,
  allProducers,
  allArtists,
  eventStartDate,
  eventEndDate,
  showTabsOnly = false,
  showContentOnly = false,
}: EventTeamContentProps) {
  const { teamTab: activeTab, setTeamTab: setActiveTab } = useEventTabs();
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [draggedArtist, setDraggedArtist] = useState<Artist | null>(null);
  const [draggedSlot, setDraggedSlot] = useState<ScheduleSlot | null>(null);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [stages, setStages] = useState<Stage[]>([
    { id: '1', name: 'Escenario Principal' },
  ]);
  const [selectedStage, setSelectedStage] = useState<string>('1');
  const [newStageName, setNewStageName] = useState("");
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<Array<{ date: string; hour: string; stageId: string }>>([]);
  const [draggingSlot, setDraggingSlot] = useState<ScheduleSlot | null>(null);
  const [dragPreview, setDragPreview] = useState<{ day: string; time: string; stage: string } | null>(null);

  // Calculate event days dynamically in user's local timezone
  const eventDays: EventDay[] = [];

  // Parse UTC dates and convert to local timezone
  const startDate = new Date(eventStartDate);
  const endDate = new Date(eventEndDate);

  // Create a date at the start of the day in local timezone
  const localStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const localEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  // Calculate total days
  const totalDays = Math.ceil((localEndDate.getTime() - localStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Collect all time slots and build event days
  let minHour = 23;
  let maxHour = 0;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(localStartDate);
    d.setDate(d.getDate() + i);

    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = DAY_NAMES[d.getDay()];
    const shortDate = `${d.getDate()}/${d.getMonth() + 1}`;

    // Determine time slots for this day
    let timeSlots: string[];

    if (i === 0) {
      // First day: start from event start hour (with 15-min intervals for editing)
      const startHour = startDate.getHours();
      timeSlots = generateDetailedTimeSlots(startHour, 23);
      minHour = Math.min(minHour, startHour);
      maxHour = 23;
    } else if (i === totalDays - 1) {
      // Last day: end at event end hour (with 15-min intervals for editing)
      const endHour = endDate.getHours();
      timeSlots = generateDetailedTimeSlots(0, endHour);
      minHour = Math.min(minHour, 0);
      maxHour = Math.max(maxHour, endHour);
    } else {
      // Middle days: full day (with 15-min intervals for editing)
      timeSlots = generateDetailedTimeSlots(0, 23);
      minHour = 0;
      maxHour = 23;
    }

    eventDays.push({ date: dateStr, dayName, shortDate, timeSlots });
  }

  // Generate hour slots for the visual grid (display only)
  const visualHourSlots = generateTimeSlots(minHour, maxHour);

  // Filter to only include hours that are available in at least one day
  const allTimeSlots = visualHourSlots.filter(time =>
    eventDays.some(day => {
      // Check if any 15-min interval within this hour is available
      const hour = time.split(':')[0];
      return day.timeSlots.some(slot => slot.startsWith(hour + ':'));
    })
  );

  // Helper to check if an hour is available for a specific day
  const isHourAvailable = (day: EventDay, hour: string) => {
    return day.timeSlots.some(slot => slot.startsWith(hour.split(':')[0] + ':'));
  };

  // Helper to get all slots that start within a specific hour for a day and stage
  const getSlotsInHour = (day: string, hour: string, stageId: string) => {
    const hourNum = parseInt(hour.split(':')[0]);
    return schedule.filter(slot => {
      if (slot.day !== day || slot.stageId !== stageId) return false;
      const slotHourNum = parseInt(slot.startTime.split(':')[0]);
      return slotHourNum === hourNum;
    });
  };

  // Add new stage
  const handleAddStage = () => {
    if (!newStageName.trim()) return;

    const newStage: Stage = {
      id: Date.now().toString(),
      name: newStageName.trim(),
    };

    setStages([...stages, newStage]);
    setNewStageName("");
    setIsAddingStage(false);
  };

  // Delete stage
  const handleDeleteStage = (stageId: string) => {
    if (stages.length === 1) {
      alert('Debe haber al menos un escenario');
      return;
    }

    // Remove all slots for this stage
    setSchedule(schedule.filter(slot => slot.stageId !== stageId));
    setStages(stages.filter(s => s.id !== stageId));

    // If we're deleting the selected stage, select the first one
    if (selectedStage === stageId) {
      setSelectedStage(stages.find(s => s.id !== stageId)?.id || '');
    }
  };

  // Helper to calculate position within hour (0-100%)
  const getPositionInHour = (time: string) => {
    const [, minute] = time.split(':').map(Number);
    return (minute / 60) * 100; // percentage within the hour
  };

  // Helper to calculate height in percentage based on duration
  const getHeightPercentage = (startTime: string, endTime: string) => {
    const timeToMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const durationMinutes = endMinutes - startMinutes;
    return (durationMinutes / 60) * 100; // percentage of hour
  };

  const handleDragStart = (artist: Artist) => {
    setDraggedArtist(artist);
  };

  const handleSlotMouseDown = (slot: ScheduleSlot, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingSlot(slot);
    setShowTooltip(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingSlot) return;

    // Find which cell the cursor is over
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;

    // Look for the calendar cell data
    const cell = element.closest('[data-cell-date]') as HTMLElement | null;
    if (!cell) return;

    const date = cell.getAttribute('data-cell-date');
    const hour = cell.getAttribute('data-cell-hour');
    const stage = cell.getAttribute('data-cell-stage');

    if (date && hour && stage) {
      // Calculate position within the cell
      const rect = cell.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const percentageY = Math.max(0, Math.min(1, relativeY / rect.height));

      // Snap to 15-minute intervals (0, 15, 30, 45)
      const intervalIndex = Math.floor(percentageY * 4);
      const minutes = Math.max(0, Math.min(3, intervalIndex)) * 15;

      // Create the time with minutes
      const hourNum = parseInt(hour.split(':')[0]);
      const time = `${String(hourNum).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      setDragPreview({ day: date, time, stage });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!draggingSlot || !dragPreview) {
      setDraggingSlot(null);
      setDragPreview(null);
      return;
    }

    e.preventDefault();

    // Call handleDrop with the time that includes minutes
    handleDrop(dragPreview.day, dragPreview.time, dragPreview.stage);

    setDraggingSlot(null);
    setDragPreview(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (day: string, time: string, stageId: string) => {
    // Convert times to minutes for comparison
    const timeToMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    // Use the pre-calculated time with 15-minute precision from dragPreview
    const startTime = time;
    const startMinutes = timeToMinutes(startTime);

    // If we're moving an existing slot
    if (draggedSlot) {
      const durationMinutes = timeToMinutes(draggedSlot.endTime) - timeToMinutes(draggedSlot.startTime);
      const totalNewMinutes = startMinutes + durationMinutes;
      const newEndHour = Math.floor(totalNewMinutes / 60);
      const newEndMinute = totalNewMinutes % 60;
      const newEndTime = `${String(newEndHour).padStart(2, '0')}:${String(newEndMinute).padStart(2, '0')}`;
      const newEndMinutes = timeToMinutes(newEndTime);

      // Check if there's a collision (excluding the current slot)
      const hasCollision = schedule.some(slot => {
        if (slot.id === draggedSlot.id || slot.day !== day || slot.stageId !== stageId) return false;
        const slotStartMinutes = timeToMinutes(slot.startTime);
        const slotEndMinutes = timeToMinutes(slot.endTime);
        return (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) ||
               (newEndMinutes > slotStartMinutes && newEndMinutes <= slotEndMinutes) ||
               (startMinutes <= slotStartMinutes && newEndMinutes >= slotEndMinutes);
      });

      if (hasCollision) {
        setDraggedSlot(null);
        return;
      }

      // Update the slot with new position
      setSchedule(schedule.map(slot =>
        slot.id === draggedSlot.id
          ? { ...slot, day, startTime, endTime: newEndTime, stageId }
          : slot
      ));
      setDraggedSlot(null);
      return;
    }

    // If we're adding a new artist
    if (!draggedArtist) return;

    // Calculate end time (1 hour after start time, maintaining minutes)
    const totalEndMinutes = startMinutes + 60;
    const endHour = Math.floor(totalEndMinutes / 60);
    const endMinute = totalEndMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    const endMinutes = timeToMinutes(endTime);

    // Check if there's a collision (only within the same stage)
    const hasCollision = schedule.some(slot => {
      if (slot.day !== day || slot.stageId !== stageId) return false;
      const slotStartMinutes = timeToMinutes(slot.startTime);
      const slotEndMinutes = timeToMinutes(slot.endTime);
      return (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) ||
             (endMinutes > slotStartMinutes && endMinutes <= slotEndMinutes) ||
             (startMinutes <= slotStartMinutes && endMinutes >= slotEndMinutes);
    });

    if (hasCollision) return;

    // Add new slot
    const newSlot: ScheduleSlot = {
      id: `${day}-${startTime}-${Date.now()}`,
      day,
      startTime,
      endTime,
      artistId: draggedArtist.id,
      artistName: draggedArtist.artist.name || 'Sin nombre',
      artistLogo: draggedArtist.artist.logo,
      stageId,
    };

    setSchedule([...schedule, newSlot]);
    setDraggedArtist(null);
  };

  const handleEditSlot = (slot: ScheduleSlot) => {
    // Close tooltip when editing
    handleSlotMouseLeave();

    setEditingSlot(slot);
    setEditStartTime(slot.startTime);
    setEditEndTime(slot.endTime);
  };

  const handleSaveEdit = () => {
    if (!editingSlot) return;

    // Convert times to minutes for comparison
    const timeToMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const startMinutes = timeToMinutes(editStartTime);
    const endMinutes = timeToMinutes(editEndTime);

    if (endMinutes <= startMinutes) {
      alert('La hora de fin debe ser después de la hora de inicio');
      return;
    }

    // Check for collisions with other slots (only within same stage and day)
    const hasCollision = schedule.some(slot => {
      if (slot.id === editingSlot.id || slot.day !== editingSlot.day || slot.stageId !== editingSlot.stageId) return false;
      const slotStartMinutes = timeToMinutes(slot.startTime);
      const slotEndMinutes = timeToMinutes(slot.endTime);
      return (startMinutes >= slotStartMinutes && startMinutes < slotEndMinutes) ||
             (endMinutes > slotStartMinutes && endMinutes <= slotEndMinutes) ||
             (startMinutes <= slotStartMinutes && endMinutes >= slotEndMinutes);
    });

    if (hasCollision) {
      alert('Este horario se superpone con otro artista en el mismo escenario');
      return;
    }

    setSchedule(schedule.map(slot =>
      slot.id === editingSlot.id
        ? { ...slot, startTime: editStartTime, endTime: editEndTime, stageId: editingSlot.stageId }
        : slot
    ));

    setEditingSlot(null);
  };

  const handleDeleteSlot = () => {
    if (!editingSlot) return;
    setSchedule(schedule.filter(slot => slot.id !== editingSlot.id));
    setEditingSlot(null);
  };

  // Handle hover with delay
  const handleSlotMouseEnter = (slotId: string) => {
    // Clear any existing timer
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }

    // Set new timer for 500ms delay
    const timer = setTimeout(() => {
      setShowTooltip(slotId);
    }, 500);

    setHoverTimer(timer);
  };

  const handleSlotMouseLeave = () => {
    setShowTooltip(null);

    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  };

  // Get full artist info
  const getArtistInfo = (artistId: string) => {
    return artists.find(a => a.id === artistId)?.artist;
  };

  // Delete all slots in a specific hour for the current stage
  const handleDeleteHourSlots = (hour: string) => {
    const hourNum = parseInt(hour.split(':')[0]);
    const slotsToDelete = schedule.filter(slot => {
      if (slot.stageId !== selectedStage) return false;
      const slotHourNum = parseInt(slot.startTime.split(':')[0]);
      return slotHourNum === hourNum;
    });

    if (slotsToDelete.length === 0) return;

    const confirmMessage = `¿Eliminar ${slotsToDelete.length} artista${slotsToDelete.length > 1 ? 's' : ''} programado${slotsToDelete.length > 1 ? 's' : ''} a las ${formatTo12Hour(hour)}?`;

    if (window.confirm(confirmMessage)) {
      setSchedule(schedule.filter(slot => {
        if (slot.stageId !== selectedStage) return true;
        const slotHourNum = parseInt(slot.startTime.split(':')[0]);
        return slotHourNum !== hourNum;
      }));
    }
  };

  const handleToggleBlockSlot = (date: string, hour: string) => {
    // Check if there are artists already scheduled in this slot
    const slotsInThisHour = getSlotsInHour(date, hour, selectedStage);
    if (slotsInThisHour.length > 0) {
      // Don't allow blocking if there are already artists scheduled
      return;
    }

    const isBlocked = blockedSlots.some(
      slot => slot.date === date && slot.hour === hour && slot.stageId === selectedStage
    );

    if (isBlocked) {
      setBlockedSlots(blockedSlots.filter(
        slot => !(slot.date === date && slot.hour === hour && slot.stageId === selectedStage)
      ));
    } else {
      setBlockedSlots([...blockedSlots, { date, hour, stageId: selectedStage }]);
    }
  };

  const isSlotBlocked = (date: string, hour: string) => {
    return blockedSlots.some(
      slot => slot.date === date && slot.hour === hour && slot.stageId === selectedStage
    );
  };

  // Tabs section
  const tabsSection = (
    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <button
        onClick={() => setActiveTab("productores")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "productores"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <UserCog className="h-4 w-4" />
        Productores
      </button>
      <button
        onClick={() => setActiveTab("artistas")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "artistas"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <Music className="h-4 w-4" />
        Artistas
      </button>
    </div>
  );

  // Content section
  const contentSection = (
    <div className="space-y-4">

      {/* Producers Section */}
      {activeTab === "productores" && (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Productores</h3>
            <p className="text-sm text-muted-foreground">
              {producers.length} productor{producers.length !== 1 ? 'es' : ''} asignado{producers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <AddProducerDialog
            eventId={eventId}
            availableProducers={allProducers.filter(
              ap => !producers.some(p => p.producer.id === ap.id)
            )}
          />
        </div>

        {producers.length === 0 ? (
          <Card className="bg-white/[0.02] border-white/5">
            <CardContent className="py-12 text-center">
              <Users className="h-10 w-10 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1 text-white">
                No hay productores asignados
              </h3>
              <p className="text-sm text-white/40">
                Asigna productores al evento para gestionar el equipo
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {producers.map((item) => {
              const producer = item.producer;
              const displayName = producer.name || 'Sin nombre';

              return (
                <Card key={item.id} className="group relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-300">
                  <CardContent className="relative pt-8 pb-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        {producer.logo ? (
                          <img
                            src={producer.logo}
                            alt={displayName}
                            className="w-20 h-20 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-white/15 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-white/15 transition-all duration-300">
                            <Users className="h-10 w-10 text-primary" />
                          </div>
                        )}
                      </div>

                      <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                        {displayName}
                      </h4>
                      <p className="text-sm text-white/40 font-medium">
                        Productor
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Artists Section */}
      {activeTab === "artistas" && (
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Artistas, Performers, Speakers, DJs, Conferencistas</h3>
          <p className="text-sm text-muted-foreground">
            {artists.length} artista{artists.length !== 1 ? 's' : ''} asignado{artists.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="w-full">
          {/* Stage selector */}
          <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
            {stages.map((stage) => (
              <div
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`group relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center ${
                  selectedStage === stage.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/5 hover:bg-white/10 text-white/60'
                }`}
              >
                <span>{stage.name}</span>
                {stages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStage(stage.id);
                    }}
                    className="ml-2 inline-flex opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Eliminar escenario"
                  >
                    <X className="h-3 w-3 text-current hover:text-red-400" />
                  </button>
                )}
              </div>
            ))}

            {isAddingStage ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Nombre del escenario"
                  className="h-9 w-48 rounded-full bg-white/5 border-white/10 px-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newStageName.trim()) handleAddStage();
                    if (e.key === 'Escape') {
                      setIsAddingStage(false);
                      setNewStageName("");
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleAddStage}
                  disabled={!newStageName.trim()}
                  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear
                </button>
                <button
                  onClick={() => {
                    setIsAddingStage(false);
                    setNewStageName("");
                  }}
                  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingStage(true)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-white/5 hover:bg-white/10 text-white/60 transition-colors flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Escenario</span>
              </button>
            )}
          </div>

            <div className="flex gap-4 items-stretch">
              {/* Artistas disponibles para arrastrar - Columna izquierda */}
              <div className="w-64 flex-shrink-0 flex">
                <Card className="bg-white/[0.02] border-white/5 flex flex-col flex-1">
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="mb-3">
                      <AddArtistDialog
                        eventId={eventId}
                        availableArtists={allArtists.filter(
                          aa => !artists.some(a => a.artist.id === aa.id)
                        )}
                        className="w-full"
                      />
                      <div className="border-t border-white/5 mt-3" />
                    </div>
                    <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                      {artists.length === 0 ? (
                        <p className="text-sm text-white/40">
                          No hay artistas asignados
                        </p>
                      ) : (
                        artists.map((item) => {
                          const artist = item.artist;
                          const displayName = artist.name || 'Sin nombre';

                          return (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={() => handleDragStart(item)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 hover:border-white/20 cursor-grab active:cursor-grabbing transition-all duration-200"
                            >
                              <GripVertical className="h-4 w-4 text-white/40 flex-shrink-0" />
                              {artist.logo ? (
                                <img
                                  src={artist.logo}
                                  alt={displayName}
                                  className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                              )}
                              <span className="text-sm font-medium truncate">{displayName}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Calendario del evento - Columna derecha */}
              <div
                className="flex-1 min-w-0 flex"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  if (draggingSlot) {
                    setDraggingSlot(null);
                    setDragPreview(null);
                  }
                }}
              >
                <Card className="bg-white/[0.02] border-white/5 overflow-hidden flex-1">
                <div className="overflow-x-auto overflow-y-visible">
                  <div style={{ minWidth: `${(eventDays.length + 1) * 150}px` }}>
                    {/* Header con días */}
                    <div className="grid border-b border-white/5" style={{ gridTemplateColumns: `120px repeat(${eventDays.length}, 1fr)` }}>
                      <div className="p-3 bg-white/[0.02] border-r border-white/5">
                        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                          Hora
                        </span>
                      </div>
                      {eventDays.map((day) => (
                        <div key={day.date} className="p-3 bg-white/[0.02] border-r border-white/5 last:border-r-0">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-white uppercase tracking-wider">
                              {day.dayName}
                            </span>
                            <span className="text-xs text-white/40 mt-0.5">
                              {day.shortDate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Grid visual de horarios por hora */}
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `120px repeat(${eventDays.length}, 1fr)`,
                        gridTemplateRows: `repeat(${allTimeSlots.length}, 80px)`
                      }}
                    >
                      {allTimeSlots.map((hour, hourIndex) => {
                        const hourNum = parseInt(hour.split(':')[0]);
                        const hasSlots = schedule.some(slot => {
                          if (slot.stageId !== selectedStage) return false;
                          const slotHourNum = parseInt(slot.startTime.split(':')[0]);
                          return slotHourNum === hourNum;
                        });

                        return (
                          <Fragment key={`hour-${hour}`}>
                          {/* Columna de hora */}
                          <div
                            onClick={() => handleDeleteHourSlots(hour)}
                            className={`p-3 bg-white/[0.02] border-r border-white/5 border-b border-white/5 flex items-center group transition-colors ${
                              hasSlots ? 'cursor-pointer hover:bg-red-500/10 hover:border-red-500/20' : ''
                            }`}
                            style={{
                              gridColumn: 1,
                              gridRow: hourIndex + 1
                            }}
                            title={hasSlots ? 'Click para eliminar todos los artistas de esta hora' : ''}
                          >
                            <span className="text-xs text-white/60 font-medium group-hover:text-white/80 transition-colors">
                              {formatTo12Hour(hour)}
                            </span>
                            {hasSlots && (
                              <X className="h-3 w-3 ml-auto text-white/0 group-hover:text-red-400 transition-colors" />
                            )}
                          </div>

                          {/* Celdas de cada día por hora */}
                          {eventDays.map((day, dayIndex) => {
                            const available = isHourAvailable(day, hour);
                            const slotsInThisHour = getSlotsInHour(day.date, hour, selectedStage);

                            if (!available) {
                              return (
                                <div
                                  key={`${day.date}-${hour}`}
                                  className="p-2 border-r border-white/5 last:border-r-0 border-b border-white/5 bg-white/[0.01]"
                                  style={{
                                    gridColumn: dayIndex + 2,
                                    gridRow: hourIndex + 1
                                  }}
                                >
                                  <div className="h-full flex items-center justify-center">
                                    <span className="text-xs text-white/10">-</span>
                                  </div>
                                </div>
                              );
                            }

                            const blocked = isSlotBlocked(day.date, hour);
                            const hasArtists = slotsInThisHour.length > 0;
                            const canBlock = !hasArtists;

                            // Check if this cell matches the drag preview (compare hour part of time)
                            const previewHour = dragPreview?.time ? dragPreview.time.split(':')[0] + ':00' : null;
                            const isPreview = dragPreview?.day === day.date && previewHour === hour && dragPreview?.stage === selectedStage;

                            return (
                              <div
                                key={`${day.date}-${hour}`}
                                data-cell-date={day.date}
                                data-cell-hour={hour}
                                data-cell-stage={selectedStage}
                                onDragOver={blocked ? undefined : handleDragOver}
                                onDrop={blocked ? undefined : () => handleDrop(day.date, hour, selectedStage)}
                                onClick={canBlock ? () => handleToggleBlockSlot(day.date, hour) : undefined}
                                className={`border-r border-white/5 last:border-r-0 border-b border-white/5 relative overflow-visible transition-all ${
                                  canBlock ? 'cursor-pointer' : ''
                                } ${
                                  blocked
                                    ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20'
                                    : 'hover:bg-white/[0.02]'
                                } ${
                                  isPreview && draggingSlot ? 'ring-2 ring-blue-500 ring-inset' : ''
                                }`}
                                style={{
                                  gridColumn: dayIndex + 2,
                                  gridRow: hourIndex + 1
                                }}
                              >
                                {slotsInThisHour.length > 0 ? (
                                  slotsInThisHour.map(slot => {
                                    const topPosition = getPositionInHour(slot.startTime);
                                    const height = getHeightPercentage(slot.startTime, slot.endTime);

                                    // Calculate duration in minutes to adjust layout
                                    const timeToMinutes = (t: string) => {
                                      const [h, m] = t.split(':').map(Number);
                                      return h * 60 + m;
                                    };
                                    const durationMinutes = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
                                    const isSmall = durationMinutes <= 30;
                                    const artistInfo = getArtistInfo(slot.artistId);

                                    // Check if this is in the last 2 columns to show tooltip on left
                                    const isNearRightEdge = dayIndex >= eventDays.length - 2;

                                    return (
                                      <div
                                        key={slot.id}
                                        onMouseDown={(e) => handleSlotMouseDown(slot, e)}
                                        onClick={() => {
                                          if (!draggingSlot) {
                                            handleEditSlot(slot);
                                          }
                                        }}
                                        onMouseEnter={() => handleSlotMouseEnter(slot.id)}
                                        onMouseLeave={handleSlotMouseLeave}
                                        className={`absolute left-0 right-0 px-2 overflow-visible z-10 ${
                                          draggingSlot?.id === slot.id ? 'opacity-50' : 'opacity-100'
                                        } cursor-grab active:cursor-grabbing transition-opacity`}
                                        style={{
                                          top: `${topPosition}%`,
                                          height: `${height}%`,
                                          minHeight: '24px'
                                        }}
                                      >
                                        <div className="h-full flex flex-col px-2 py-1 rounded-lg bg-primary/20 border border-primary/30 hover:border-primary/50 cursor-pointer transition-all duration-200 group overflow-hidden relative">
                                          {isSmall ? (
                                            // Compact layout for small slots
                                            <div className="flex items-center gap-1.5 min-h-0 overflow-hidden">
                                              {slot.artistLogo ? (
                                                <img
                                                  src={slot.artistLogo}
                                                  alt={slot.artistName}
                                                  className="w-4 h-4 rounded object-cover flex-shrink-0"
                                                />
                                              ) : (
                                                <div className="w-4 h-4 rounded bg-primary/30 flex items-center justify-center flex-shrink-0">
                                                  <Users className="h-2.5 w-2.5 text-primary" />
                                                </div>
                                              )}
                                              <span className="text-[10px] font-medium truncate flex-1 leading-tight">
                                                {slot.artistName}
                                              </span>
                                            </div>
                                          ) : (
                                            // Full layout for normal slots
                                            <>
                                              <div className="flex items-center gap-2 min-h-0 overflow-hidden">
                                                {slot.artistLogo ? (
                                                  <img
                                                    src={slot.artistLogo}
                                                    alt={slot.artistName}
                                                    className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                                                  />
                                                ) : (
                                                  <div className="w-6 h-6 rounded-md bg-primary/30 flex items-center justify-center flex-shrink-0">
                                                    <Users className="h-3 w-3 text-primary" />
                                                  </div>
                                                )}
                                                <span className="text-xs font-medium truncate flex-1 group-hover:text-white/80">
                                                  {slot.artistName}
                                                </span>
                                                <Edit2 className="h-3 w-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                              </div>
                                              <div className="text-[10px] text-white/60 font-medium truncate">
                                                {formatTo12Hour(slot.startTime)} - {formatTo12Hour(slot.endTime)}
                                              </div>
                                            </>
                                          )}

                                          {/* Tooltip con perfil del artista */}
                                          {showTooltip === slot.id && artistInfo && (
                                            <div
                                              className={`absolute top-0 w-80 bg-background/98 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in duration-200 pointer-events-none ${
                                                isNearRightEdge
                                                  ? 'right-full mr-2 slide-in-from-right-2'
                                                  : 'left-full ml-2 slide-in-from-left-2'
                                              }`}
                                            >
                                              <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                  {artistInfo.logo ? (
                                                    <img
                                                      src={artistInfo.logo}
                                                      alt={artistInfo.name || 'Artista'}
                                                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/10"
                                                    />
                                                  ) : (
                                                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center ring-2 ring-white/10">
                                                      <Users className="h-8 w-8 text-primary" />
                                                    </div>
                                                  )}
                                                  <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-base mb-1 truncate">
                                                      {artistInfo.name || 'Sin nombre'}
                                                    </h4>
                                                    {artistInfo.category && (
                                                      <p className="text-xs text-white/60 font-medium">
                                                        {artistInfo.category}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>

                                                {artistInfo.description && (
                                                  <div className="pt-2 border-t border-white/10">
                                                    <p className="text-sm text-white/80 leading-relaxed">
                                                      {artistInfo.description}
                                                    </p>
                                                  </div>
                                                )}

                                                <div className="pt-2 border-t border-white/10">
                                                  <div className="flex items-center justify-between text-xs">
                                                    <span className="text-white/40">Horario:</span>
                                                    <span className="text-white/80 font-medium">
                                                      {formatTo12Hour(slot.startTime)} - {formatTo12Hour(slot.endTime)}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center justify-between text-xs mt-1">
                                                    <span className="text-white/40">Escenario:</span>
                                                    <span className="text-white/80 font-medium">
                                                      {stages.find(s => s.id === slot.stageId)?.name}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="h-full flex items-center justify-center" title={blocked ? "Click para desbloquear este horario" : ""}>
                                    {blocked ? (
                                      <Lock className="h-4 w-4 text-red-400/60" />
                                    ) : (
                                      <span className="text-xs text-white/20">+</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          </Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
                </Card>
              </div>
            </div>
        </div>
      </div>
      )}

      {/* Edit Slot Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Horario</DialogTitle>
            <DialogDescription>
              Modifica el horario de presentación de {editingSlot?.artistName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Artist info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              {editingSlot?.artistLogo ? (
                <img
                  src={editingSlot.artistLogo}
                  alt={editingSlot.artistName}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <p className="font-semibold">{editingSlot?.artistName}</p>
                <p className="text-sm text-white/60">
                  {eventDays.find(d => d.date === editingSlot?.day)?.dayName} {eventDays.find(d => d.date === editingSlot?.day)?.shortDate}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {stages.find(s => s.id === editingSlot?.stageId)?.name}
                </p>
              </div>
            </div>

            {/* Stage selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Escenario</label>
              <Select
                value={editingSlot?.stageId}
                onValueChange={(value) => {
                  if (editingSlot) {
                    setEditingSlot({ ...editingSlot, stageId: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar escenario" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora inicio</label>
                <Select value={editStartTime} onValueChange={setEditStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventDays.find(d => d.date === editingSlot?.day)?.timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{formatTo12Hour(time)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hora fin</label>
                <Select value={editEndTime} onValueChange={setEditEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventDays.find(d => d.date === editingSlot?.day)?.timeSlots.map(time => {
                      const [h, m] = time.split(':').map(Number);
                      // Add 15 minutes for minimum duration
                      let endHour = h;
                      let endMinute = m + 15;
                      if (endMinute >= 60) {
                        endHour += 1;
                        endMinute = endMinute % 60;
                      }
                      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
                      return <SelectItem key={`end-${time}`} value={endTime}>{formatTo12Hour(endTime)}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <Button variant="destructive" onClick={handleDeleteSlot}>
              Eliminar
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditingSlot(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
