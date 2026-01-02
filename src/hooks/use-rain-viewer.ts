"use client";

import { useQuery } from "@tanstack/react-query";
import { getRainViewerData } from "@/lib/weather-apis";

export function useRainViewer() {
  return useQuery({
    queryKey: ["rain-viewer"],
    queryFn: getRainViewerData,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
  });
}
