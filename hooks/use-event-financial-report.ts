"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import type { EventFinancialReport } from "@/lib/supabase/types";

export function useEventFinancialReport(eventId: string) {
  const [data, setData] = useState<EventFinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchReport() {
      try {
        setLoading(true);
        setError(null);

        const { data: report, error: rpcError } = await supabaseClient.rpc(
          "get_event_sales_summary_with_validation",
          {
            p_event_id: eventId,
          }
        );

        if (!mounted) return;

        if (rpcError) {
          console.error("Error fetching financial report:", rpcError);
          setError("No se pudo cargar el reporte financiero");
          setData(null);
        } else {
          setData(report);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Unexpected error:", err);
        setError("Error inesperado al cargar el reporte");
        setData(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchReport();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  return { data, loading, error };
}
