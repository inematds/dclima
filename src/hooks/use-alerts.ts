"use client";

import { useQuery } from "@tanstack/react-query";
import { getWeatherAlerts } from "@/lib/weather-apis";

export function useWeatherAlerts() {
  return useQuery({
    queryKey: ["weather-alerts"],
    queryFn: getWeatherAlerts,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Atualizar a cada 10 minutos
  });
}
