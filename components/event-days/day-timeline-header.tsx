"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { EventDayOutput } from "@/actions/event-days";

type EventDay = EventDayOutput;

interface DayTimelineHeaderProps {
  days: EventDay[];
  selectedDayId: string | null;
  onDayClick: (dayId: string) => void;
}

interface PositionedDay extends EventDay {
  position: number;
  dayNumber: number;
}

interface Gap {
  from: number;
  to: number;
  days: number;
}

export function DayTimelineHeader({
  days,
  selectedDayId,
  onDayClick,
}: DayTimelineHeaderProps) {
  const { positionedDays, gaps } = useMemo(() => {
    // Filter days with valid dates and sort by date
    const validDays = days
      .filter((d) => d.date)
      .map((d, index) => ({ ...d, dayNumber: index + 1 }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (validDays.length === 0) {
      return { positionedDays: [], gaps: [] };
    }

    // Calculate positions
    if (validDays.length === 1) {
      return {
        positionedDays: [{ ...validDays[0], position: 50 }],
        gaps: [],
      };
    }

    const minDate = new Date(validDays[0].date).getTime();
    const maxDate = new Date(validDays[validDays.length - 1].date).getTime();
    const range = maxDate - minDate;

    const positioned: PositionedDay[] = validDays.map((day) => {
      const dayTime = new Date(day.date).getTime();
      const position = range > 0 ? ((dayTime - minDate) / range) * 100 : 0;
      return { ...day, position };
    });

    // Detect gaps (more than 1 day between consecutive days)
    const detectedGaps: Gap[] = [];
    for (let i = 0; i < positioned.length - 1; i++) {
      const current = new Date(positioned[i].date);
      const next = new Date(positioned[i + 1].date);
      const diffDays = Math.floor(
        (next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > 1) {
        detectedGaps.push({
          from: i,
          to: i + 1,
          days: diffDays - 1,
        });
      }
    }

    return { positionedDays: positioned, gaps: detectedGaps };
  }, [days]);

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  if (positionedDays.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Agrega días para ver la línea de tiempo del festival
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="relative h-32">
        {/* Timeline line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-zinc-300 dark:bg-zinc-700" />

        {/* Days */}
        <div className="relative h-full">
          {positionedDays.map((day, index) => {
            const isSelected = day.id === selectedDayId;
            const gap = gaps.find((g) => g.from === index);

            return (
              <div
                key={day.id}
                className="absolute top-0"
                style={{
                  left: `${day.position}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {/* Day node */}
                <button
                  onClick={() => onDayClick(day.id)}
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-2 group cursor-pointer",
                    "transition-all duration-200"
                  )}
                >
                  {/* Node circle */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm",
                      "transition-all duration-200",
                      isSelected
                        ? "bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 scale-110"
                        : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300",
                      !isSelected &&
                        "group-hover:border-zinc-400 dark:group-hover:border-zinc-600 group-hover:scale-105"
                    )}
                  >
                    {day.dayNumber}
                  </div>

                  {/* Day name and date */}
                  <div className="text-center">
                    <div
                      className={cn(
                        "text-xs font-semibold transition-colors",
                        isSelected
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      {day.name || `Día ${day.dayNumber}`}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {formatDateShort(day.date)}
                    </div>
                  </div>
                </button>

                {/* Gap indicator */}
                {gap && (
                  <div
                    className="absolute top-8 left-6 h-0.5 bg-dashed"
                    style={{
                      width: `calc(${
                        positionedDays[gap.to].position - day.position
                      }% - 3rem)`,
                      backgroundImage:
                        "repeating-linear-gradient(to right, #a1a1aa 0, #a1a1aa 8px, transparent 8px, transparent 16px)",
                    }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 px-2 py-1 rounded-full border border-zinc-300 dark:border-zinc-700">
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {gap.days} {gap.days === 1 ? "día" : "días"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
