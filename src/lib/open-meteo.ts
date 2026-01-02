import type { WeatherData, Location } from "@/types/weather";

const BASE_URL = "https://api.open-meteo.com/v1";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1";

export async function searchLocations(query: string): Promise<Location[]> {
  const response = await fetch(
    `${GEOCODING_URL}/search?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar localizacoes");
  }

  const data = await response.json();

  if (!data.results) {
    return [];
  }

  return data.results.map((result: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  }) => ({
    id: String(result.id),
    name: result.admin1 ? `${result.name}, ${result.admin1}` : result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
  }));
}

export async function getWeatherData(
  latitude: number,
  longitude: number,
  locationName: string
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "wind_speed_10m",
      "weather_code",
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "wind_speed_10m",
      "weather_code",
    ].join(","),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "weather_code",
    ].join(","),
    timezone: "America/Sao_Paulo",
    forecast_days: "7",
  });

  const response = await fetch(`${BASE_URL}/forecast?${params}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar dados meteorologicos");
  }

  const data = await response.json();

  return {
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      time: data.current.time,
    },
    hourly: {
      time: data.hourly.time,
      temperature: data.hourly.temperature_2m,
      apparentTemperature: data.hourly.apparent_temperature,
      humidity: data.hourly.relative_humidity_2m,
      precipitation: data.hourly.precipitation,
      windSpeed: data.hourly.wind_speed_10m,
      weatherCode: data.hourly.weather_code,
    },
    daily: {
      time: data.daily.time,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
      precipitationSum: data.daily.precipitation_sum,
      weatherCode: data.daily.weather_code,
    },
    location: {
      name: locationName,
      latitude,
      longitude,
    },
  };
}

export const DEFAULT_LOCATION: Location = {
  id: "default",
  name: "Sao Paulo",
  latitude: -23.5505,
  longitude: -46.6333,
  country: "Brasil",
};
