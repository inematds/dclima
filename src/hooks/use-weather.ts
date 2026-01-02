"use client";

import { useQuery } from "@tanstack/react-query";
import { getWeatherData, DEFAULT_LOCATION } from "@/lib/open-meteo";
import type { Location } from "@/types/weather";

export function useWeather(location: Location = DEFAULT_LOCATION) {
  return useQuery({
    queryKey: ["weather", location.latitude, location.longitude],
    queryFn: () =>
      getWeatherData(location.latitude, location.longitude, location.name),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000, // 10 minutos
  });
}
