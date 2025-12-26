"use client";

import { SimpleDateTimePicker } from "@/components/ui/simple-datetime-picker";

interface SingleDatePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function SingleDatePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: SingleDatePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SimpleDateTimePicker
        name="startDate"
        label="Fecha y hora de inicio"
        value={startDate}
        onChange={onStartDateChange}
        placeholder="Selecciona fecha y hora"
        required
      />
      <SimpleDateTimePicker
        name="endDate"
        label="Fecha y hora de fin"
        value={endDate}
        onChange={onEndDateChange}
        placeholder="Selecciona fecha y hora"
        minDate={startDate ? new Date(startDate) : undefined}
        required
      />
    </div>
  );
}
