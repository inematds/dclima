export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  time: string;
}

export interface HourlyForecast {
  time: string[];
  temperature: number[];
  apparentTemperature: number[];
  humidity: number[];
  precipitation: number[];
  windSpeed: number[];
  weatherCode: number[];
}

export interface DailyForecast {
  time: string[];
  temperatureMax: number[];
  temperatureMin: number[];
  precipitationSum: number[];
  weatherCode: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Ceu limpo", icon: "sun" },
  1: { description: "Predominantemente limpo", icon: "sun" },
  2: { description: "Parcialmente nublado", icon: "cloud-sun" },
  3: { description: "Nublado", icon: "cloud" },
  45: { description: "Neblina", icon: "cloud-fog" },
  48: { description: "Neblina com geada", icon: "cloud-fog" },
  51: { description: "Garoa leve", icon: "cloud-drizzle" },
  53: { description: "Garoa moderada", icon: "cloud-drizzle" },
  55: { description: "Garoa intensa", icon: "cloud-drizzle" },
  61: { description: "Chuva leve", icon: "cloud-rain" },
  63: { description: "Chuva moderada", icon: "cloud-rain" },
  65: { description: "Chuva intensa", icon: "cloud-rain" },
  71: { description: "Neve leve", icon: "cloud-snow" },
  73: { description: "Neve moderada", icon: "cloud-snow" },
  75: { description: "Neve intensa", icon: "cloud-snow" },
  80: { description: "Pancadas de chuva leves", icon: "cloud-rain-wind" },
  81: { description: "Pancadas de chuva moderadas", icon: "cloud-rain-wind" },
  82: { description: "Pancadas de chuva violentas", icon: "cloud-rain-wind" },
  95: { description: "Tempestade", icon: "cloud-lightning" },
  96: { description: "Tempestade com granizo leve", icon: "cloud-lightning" },
  99: { description: "Tempestade com granizo forte", icon: "cloud-lightning" },
};
