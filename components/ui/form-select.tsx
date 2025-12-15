"use client";

import { forwardRef, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  success?: boolean;
  containerClassName?: string;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      success,
      containerClassName,
      className,
      disabled,
      required,
      children,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="text-sm font-medium text-gray-600 dark:text-white/60 select-none"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <div className="text-gray-500 dark:text-white/40">{icon}</div>
            </div>
          )}

          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              "w-full px-4 py-3 rounded-xl text-sm transition-all duration-200",
              "border bg-gray-50/50 dark:bg-[#202020]/50 backdrop-blur-sm",
              "focus:outline-none focus:ring-2",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-[#1a1a1a]",
              "appearance-none cursor-pointer",

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

              className
            )}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25em 1.25em'
            }}
            {...props}
          >
            {children}
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

FormSelect.displayName = "FormSelect";

export { FormSelect };
