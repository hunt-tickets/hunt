"use client";

import { forwardRef, TextareaHTMLAttributes, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  containerClassName?: string;
  showCharCount?: boolean;
  autoResize?: boolean;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      error,
      hint,
      success,
      containerClassName,
      className,
      disabled,
      required,
      maxLength,
      showCharCount = false,
      autoResize = false,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasSuccess = success && !hasError;
    const [charCount, setCharCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      if (value) {
        setCharCount(String(value).length);
      }
    }, [value]);

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }, [value, autoResize]);

    const handleRef = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={props.id || props.name}
              className="text-sm font-medium text-gray-600 dark:text-white/60 select-none"
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {showCharCount && maxLength && (
            <span className="text-xs text-gray-500 dark:text-white/40">
              {charCount}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={handleRef}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          onChange={(e) => {
            setCharCount(e.target.value.length);
            onChange?.(e);
          }}
          className={cn(
            // Base styles
            "w-full px-4 py-3 rounded-xl text-sm transition-all duration-200",
            "border bg-gray-50/50 dark:bg-[#202020]/50 backdrop-blur-sm",
            "focus:outline-none focus:ring-2",
            "placeholder:text-gray-400 dark:placeholder:text-white/30",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-[#1a1a1a]",
            "resize-none",

            // Auto resize
            autoResize ? "overflow-hidden" : "min-h-[120px]",

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

FormTextarea.displayName = "FormTextarea";

export { FormTextarea };
