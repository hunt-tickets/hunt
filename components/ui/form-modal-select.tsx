"use client";

import { forwardRef, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface FormModalSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface FormModalSelectProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  success?: boolean;
  containerClassName?: string;
  disabled?: boolean;
  required?: boolean;
  value: string | number;
  onChange: (value: string) => void;
  options: FormModalSelectOption[];
  placeholder?: string;
}

const FormModalSelect = forwardRef<HTMLButtonElement, FormModalSelectProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      success,
      containerClassName,
      disabled,
      required,
      value,
      onChange,
      options,
      placeholder = "Selecciona una opción",
      id,
      name,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    // Find the selected option label
    const selectedOption = options.find((opt) => opt.value === String(value));
    const displayValue = selectedOption?.label || placeholder;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={id || name} className="text-sm font-medium">
            {label}
            {required && <span className="text-gray-400 ml-1">*</span>}
          </Label>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              ref={ref}
              type="button"
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-colors text-left",
                hasError &&
                  "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10",
                hasSuccess &&
                  "border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10",
                !hasError &&
                  !hasSuccess &&
                  "border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {icon && (
                  <div className="flex-shrink-0 text-gray-500 dark:text-white/40">
                    {icon}
                  </div>
                )}
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    selectedOption
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {displayValue}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[280px] p-1 border-gray-200 dark:border-[#2a2a2a] rounded-xl bg-gray-50 dark:bg-[#1a1a1a]"
            align="start"
          >
            <div className="flex flex-col max-h-[320px] overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="px-3 py-2 text-left text-sm hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors rounded-lg text-gray-900 dark:text-white"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {(hint || error) && (
          <p
            className={cn(
              "text-xs",
              hasError && "text-red-600 dark:text-red-400",
              !hasError && "text-gray-500 dark:text-white/40"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

FormModalSelect.displayName = "FormModalSelect";

export { FormModalSelect };
