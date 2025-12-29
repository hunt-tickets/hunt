import { Search } from "lucide-react";
import { UI } from "@/constants/integrations";

export function IntegrationEmptyState() {
  return (
    <div className="text-center py-16" role="status" aria-live="polite">
      <Search
        className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-white/20"
        aria-hidden="true"
      />
      <p className="text-gray-500 dark:text-white/50 text-lg font-medium mb-2">
        {UI.EMPTY_STATE.TITLE}
      </p>
      <p className="text-sm text-gray-400 dark:text-white/40">
        {UI.EMPTY_STATE.DESCRIPTION}
      </p>
    </div>
  );
}
