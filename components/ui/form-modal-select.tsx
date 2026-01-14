"use client";

import { forwardRef, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface FormModalSelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface FormModalSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  success?: boolean;
  containerClassName?: string;
  onChange: (value: string) => void;
  options: FormModalSelectOption[];
  placeholder?: string;
}

const FormModalSelect = forwardRef<HTMLSelectElement, FormModalSelectProps>(
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
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label
            htmlFor={id || name}
            className="text-sm font-medium"
          >
            {label}
            {required && <span className="text-gray-400 ml-1">*</span>}
          </Label>
        )}

        <div className={cn(
          "relative flex items-center p-4 rounded-xl border transition-colors",
          hasError && "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10",
          hasSuccess && "border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10",
          !hasError && !hasSuccess && "border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#202020] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#252525]",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          {icon && (
            <div className="mr-3 flex-shrink-0 text-gray-500 dark:text-white/40">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            id={id}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full",
              "text-gray-900 dark:text-white",
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
    );
  }
);

FormModalSelect.displayName = "FormModalSelect";

export { FormModalSelect };
