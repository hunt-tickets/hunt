"use client";

import { useState } from "react";
import { Fingerprint } from "lucide-react";

// Sanitization helper
const sanitizeDocumentNumber = (doc: string): string => {
  // Allow only alphanumeric characters
  return doc
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .toUpperCase()
    .trim()
    .slice(0, 20); // Limit length
};

interface DocumentManagerProps {
  documentType?: string | null;
  documentNumber?: string | null;
}

export function DocumentManager({ documentType, documentNumber }: DocumentManagerProps) {
  const [docType, setDocType] = useState(documentType || "");
  const [docNumber, setDocNumber] = useState(documentNumber || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleDocumentNumberChange = (value: string) => {
    setDocNumber(sanitizeDocumentNumber(value));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save functionality with Better Auth
      console.log("Saving document:", { docType, docNumber });
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Document Type */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[60px] sm:min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Fingerprint className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            onBlur={handleSave}
            disabled={isLoading}
            className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full text-foreground appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25em 1.25em'
            }}
          >
            <option value="" disabled>Tipo de documento</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PA">Pasaporte</option>
            <option value="PEP">PEP</option>
          </select>
        </div>
      </div>

      {/* Document Number */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[60px] sm:min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Fingerprint className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={docNumber}
            onChange={(e) => handleDocumentNumberChange(e.target.value)}
            onBlur={handleSave}
            disabled={isLoading}
            placeholder="Número de documento"
            maxLength={20}
            autoComplete="off"
            className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
