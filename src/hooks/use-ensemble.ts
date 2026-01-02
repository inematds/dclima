"use client";

import { useQuery } from "@tanstack/react-query";
import { getEnsembleComparison } from "@/lib/weather-apis";
import type { Location } from "@/types/weather";

export function useEnsembleComparison(location: Location) {
  return useQuery({
    queryKey: ["ensemble", location.latitude, location.longitude],
    queryFn: () => getEnsembleComparison(location.latitude, location.longitude),
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
  });
}
