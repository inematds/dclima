// APIs adicionais para o dashboard meteorologico

export interface WeatherAlert {
  id: string;
  evento: string;
  severidade: string;
  inicio: string;
  fim: string;
  descricao: string;
  instrucoes: string;
  municipios: string[];
}

export interface RainViewerData {
  radar: {
    past: Array<{ time: number; path: string }>;
    nowcast: Array<{ time: number; path: string }>;
  };
  satellite?: {
    infrared: Array<{ time: number; path: string }>;
  };
  host: string;
}

// INMET - Alertas meteorologicos ativos (Brasil)
export async function getWeatherAlerts(): Promise<WeatherAlert[]> {
  try {
    const response = await fetch(
      "https://apiprevmet3.inmet.gov.br/avisos/ativos",
      { next: { revalidate: 300 } } // Cache por 5 minutos
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Mapear a resposta do INMET para nosso formato
    if (Array.isArray(data)) {
      return data.map((alert: {
        id_aviso?: string;
        evento?: string;
        severidade?: string;
        data_inicio?: string;
        data_fim?: string;
        descricao?: string;
        instrucoes?: string;
        municipios?: string[];
      }, index: number) => ({
        id: alert.id_aviso || String(index),
        evento: alert.evento || "Alerta",
        severidade: alert.severidade || "Moderada",
        inicio: alert.data_inicio || "",
        fim: alert.data_fim || "",
        descricao: alert.descricao || "",
        instrucoes: alert.instrucoes || "",
        municipios: alert.municipios || [],
      }));
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar alertas INMET:", error);
    return [];
  }
}

// RainViewer - Radar de chuva em tempo real
export async function getRainViewerData(): Promise<RainViewerData | null> {
  try {
    const response = await fetch(
      "https://api.rainviewer.com/public/weather-maps.json"
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as RainViewerData;
  } catch (error) {
    console.error("Erro ao buscar dados RainViewer:", error);
    return null;
  }
}

// OpenWeatherMap tile URL builder
export function getOWMTileUrl(
  layer: "temp_new" | "precipitation_new" | "clouds_new" | "wind_new",
  z: number,
  x: number,
  y: number
): string {
  const apiKey = process.env.NEXT_PUBLIC_OWM_API_KEY;
  return `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;
}

// Open-Meteo Historical API
export async function getHistoricalWeather(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: startDate,
    end_date: endDate,
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "precipitation_sum",
      "rain_sum",
      "weather_code",
      "wind_speed_10m_max",
    ].join(","),
    timezone: "America/Sao_Paulo",
  });

  const response = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?${params}`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar dados historicos");
  }

  return response.json();
}

// Formatar data para API (YYYY-MM-DD)
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Obter datas para historico (ultimos N dias)
export function getHistoricalDateRange(days: number = 7) {
  const end = new Date();
  end.setDate(end.getDate() - 1); // Ontem (dados de hoje podem nao estar disponiveis)

  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    startDate: formatDateForAPI(start),
    endDate: formatDateForAPI(end),
  };
}
