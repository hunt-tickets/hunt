"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  success?: boolean;
  containerClassName?: string;
}

const GlassInputWrapper = forwardRef<HTMLInputElement, FormInputProps>(
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
            {required && <span className="text-gray-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <div className="text-gray-500 dark:text-white/40">{icon}</div>
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              "w-full px-4 py-3 rounded-xl text-sm transition-all duration-200",
              "border bg-gray-50/50 dark:bg-[#202020]/50 backdrop-blur-sm",
              "focus:outline-none focus:ring-2",
              "placeholder:text-gray-400 dark:placeholder:text-white/30",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-[#1a1a1a]",

              // Icon padding
              icon && "pl-10",

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
            {...props}
          />
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

GlassInputWrapper.displayName = "FormInput";

export { GlassInputWrapper as FormInput };
