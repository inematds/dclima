"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getHistoricalWeather,
  getHistoricalDateRange,
} from "@/lib/weather-apis";
import type { Location } from "@/types/weather";

export interface HistoricalDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  precipitationSum: number;
  rainSum: number;
  weatherCode: number;
  windSpeedMax: number;
}

export function useHistoricalWeather(location: Location, days: number = 7) {
  return useQuery({
    queryKey: ["historical", location.latitude, location.longitude, days],
    queryFn: async () => {
      const { startDate, endDate } = getHistoricalDateRange(days);
      const data = await getHistoricalWeather(
        location.latitude,
        location.longitude,
        startDate,
        endDate
      );

      // Transformar dados para formato mais facil de usar
      const historical: HistoricalDay[] = data.daily.time.map(
        (date: string, index: number) => ({
          date,
          temperatureMax: data.daily.temperature_2m_max[index],
          temperatureMin: data.daily.temperature_2m_min[index],
          apparentTemperatureMax: data.daily.apparent_temperature_max[index],
          apparentTemperatureMin: data.daily.apparent_temperature_min[index],
          precipitationSum: data.daily.precipitation_sum[index],
          rainSum: data.daily.rain_sum[index],
          weatherCode: data.daily.weather_code[index],
          windSpeedMax: data.daily.wind_speed_10m_max[index],
        })
      );

      return historical;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos (dados historicos mudam pouco)
    retry: 2,
  });
}
