"use client";

import { forwardRef, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Check } from "lucide-react";

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
  sheetTitle?: string;
  sheetDescription?: string;
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
      sheetTitle,
      sheetDescription,
      id,
      name,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    // Find the selected option label
    const selectedOption = options.find(
      (opt) => opt.value === String(value)
    );
    const displayValue = selectedOption?.label || placeholder;

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setOpen(false);
    };

    return (
      <>
        <div className={cn("space-y-2", containerClassName)}>
          {label && (
            <label
              htmlFor={id || name}
              className="text-sm font-medium text-gray-600 dark:text-white/60 select-none"
            >
              {label}
              {required && <span className="text-gray-400 ml-1">*</span>}
            </label>
          )}

          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="text-gray-500 dark:text-white/40">{icon}</div>
              </div>
            )}

            <button
              ref={ref}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setOpen(true)}
              className={cn(
                // Base styles
                "w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 text-left",
                "border bg-gray-50/50 dark:bg-[#202020]/50 backdrop-blur-sm",
                "focus:outline-none focus:ring-2",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-[#1a1a1a]",

                // Icon padding
                icon ? "pl-10 pr-10" : "pr-10",

                // States
                hasError && [
                  "border-red-300 dark:border-red-800",
                  "focus:border-red-500 dark:focus:border-red-600",
                  "focus:ring-red-500/20 dark:focus:ring-red-500/20",
                ],
                hasSuccess && [
                  "border-green-300 dark:border-green-800",
                  "focus:border-green-500 dark:focus:border-green-600",
                  "focus:ring-green-500/20 dark:focus:ring-green-500/20",
                ],
                !hasError && !hasSuccess && [
                  "border-gray-200 dark:border-[#2a2a2a]",
                  "hover:border-gray-300 dark:hover:border-[#333333]",
                  "focus:border-gray-900 dark:focus:border-white/50",
                  "focus:ring-gray-900/10 dark:focus:ring-white/10",
                ],

                // Placeholder color
                !selectedOption && "text-gray-400 dark:text-white/30"
              )}
            >
              <span className={cn(
                "block truncate",
                selectedOption && "font-medium"
              )}>
                {displayValue}
              </span>
              {/* Chevron icon */}
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>
          </div>

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

        {/* Selection Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="max-h-[80vh] overflow-y-auto bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-[#2a2a2a]"
          >
            <SheetHeader>
              <SheetTitle>{sheetTitle || label || "Selecciona una opción"}</SheetTitle>
              {sheetDescription && (
                <SheetDescription>{sheetDescription}</SheetDescription>
              )}
            </SheetHeader>

            <div className="mt-6 space-y-2">
              {options.map((option) => {
                const isSelected = String(value) === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      isSelected
                        ? "border-gray-400 dark:border-[#3a3a3a] bg-gray-200 dark:bg-[#2a2a2a] ring-1 ring-gray-300 dark:ring-[#3a3a3a]"
                        : "border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a] hover:border-gray-300 dark:hover:border-[#333333] hover:bg-gray-100 dark:hover:bg-[#202020]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        {option.description && (
                          <p className="text-xs text-gray-600 dark:text-white/60 mt-1">
                            {option.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-gray-900 dark:text-white flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }
);

FormModalSelect.displayName = "FormModalSelect";

export { FormModalSelect };
