"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UI, ARIA_LABELS } from "@/constants/integrations";

interface IntegrationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function IntegrationSearch({ value, onChange }: IntegrationSearchProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-white/50"
        aria-hidden="true"
      />
      <Input
        type="text"
        placeholder={UI.SEARCH_PLACEHOLDER}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 pl-12 pr-4 rounded-xl border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 focus:bg-gray-200 dark:focus:bg-white/10 transition-colors text-base placeholder:text-gray-600 dark:placeholder:text-white/50"
        aria-label={ARIA_LABELS.SEARCH}
      />
    </div>
  );
}
