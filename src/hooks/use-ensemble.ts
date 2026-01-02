"use client";

import { useQuery } from "@tanstack/react-query";
import { getEnsembleComparison, getEnsembleWithPast, getObservedData } from "@/lib/weather-apis";
import type { Location } from "@/types/weather";

export function useEnsembleComparison(location: Location) {
  return useQuery({
    queryKey: ["ensemble", location.latitude, location.longitude],
    queryFn: () => getEnsembleComparison(location.latitude, location.longitude),
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
  });
}

export function useEnsembleWithPast(location: Location) {
  return useQuery({
    queryKey: ["ensemble-past", location.latitude, location.longitude],
    queryFn: () => getEnsembleWithPast(location.latitude, location.longitude),
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
  });
}

export function useObservedData(location: Location, days: number = 7) {
  return useQuery({
    queryKey: ["observed", location.latitude, location.longitude, days],
    queryFn: () => getObservedData(location.latitude, location.longitude, days),
    staleTime: 60 * 60 * 1000, // 1 hora (dados historicos mudam pouco)
    retry: 2,
  });
}
