"use client";

import { useState, useCallback } from "react";
import { Fingerprint, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DOCUMENT_TYPES, VALIDATION } from "@/constants/profile";
import { sanitizeDocumentNumber } from "@/lib/profile/utils";
import type { DocumentManagerProps } from "@/lib/profile/types";

export function DocumentManager({ documentType, documentNumber }: DocumentManagerProps) {
  const [docType, setDocType] = useState(documentType || "");
  const [docNumber, setDocNumber] = useState(documentNumber || "");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDocumentNumberChange = useCallback((value: string) => {
    const sanitized = sanitizeDocumentNumber(value);
    setDocNumber(sanitized);
  }, []);

  const handleSave = useCallback(async () => {
    // Skip save if both fields are empty
    if (!docType && !docNumber) return;

    setIsLoading(true);
    try {
      // TODO: Implement save functionality with Better Auth
      // await authClient.updateDocument({ documentType: docType, documentNumber: docNumber });

      // For now, just simulate saving
      await new Promise((resolve) => setTimeout(resolve, 500));

      // toast.success(SUCCESS_MESSAGES.DOCUMENT_SAVED);
    } catch (error) {
      // toast.error(ERROR_MESSAGES.DOCUMENT_SAVE_FAILED);
      // Log error for debugging (will be removed in production)
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving document:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [docType, docNumber]);

  return (
    <div className="space-y-3">
      {/* Document Type */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group"
            role="button"
            aria-label={docType ? `Tipo de documento: ${DOCUMENT_TYPES.find(t => t.value === docType)?.label}` : "Seleccionar tipo de documento"}
            tabIndex={0}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Fingerprint
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-foreground">
                {docType ? DOCUMENT_TYPES.find(t => t.value === docType)?.label : "Tipo de documento (Opcional)"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-2" align="start">
          <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
            {DOCUMENT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setDocType(type.value);
                  setOpen(false);
                  handleSave();
                }}
                className="px-4 py-3 text-left text-sm font-medium rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors"
              >
                {type.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Document Number */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Fingerprint
            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            inputMode="numeric"
            value={docNumber}
            onChange={(e) => handleDocumentNumberChange(e.target.value)}
            onBlur={handleSave}
            disabled={isLoading}
            placeholder="Número de documento (Opcional)"
            maxLength={VALIDATION.MAX_DOCUMENT_LENGTH}
            autoComplete="off"
            aria-label="Número de documento"
            className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
