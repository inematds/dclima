"use client";

import { useLocation } from "@/contexts/location-context";
import { useWeather } from "@/hooks/use-weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { WEATHER_CODES } from "@/types/weather";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudSun,
  Thermometer,
  Droplets,
} from "lucide-react";

const weatherIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-rain-wind": CloudRain,
  "cloud-snow": CloudSnow,
  "cloud-lightning": CloudLightning,
  "cloud-fog": Cloud,
  "cloud-drizzle": CloudRain,
};

function DayCard({
  date,
  tempMax,
  tempMin,
  precipitation,
  weatherCode,
  isLoading,
}: {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  weatherCode: number;
  isLoading?: boolean;
}) {
  const weatherInfo = WEATHER_CODES[weatherCode] || {
    description: "Desconhecido",
    icon: "cloud",
  };
  const WeatherIcon = weatherIcons[weatherInfo.icon] || Cloud;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const parsedDate = parseISO(date);
  const isToday =
    format(new Date(), "yyyy-MM-dd") === format(parsedDate, "yyyy-MM-dd");

  return (
    <Card className={isToday ? "ring-2 ring-primary" : ""}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Data */}
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {format(parsedDate, "EEEE", { locale: ptBR })}
            </p>
            <p className="text-lg font-semibold">
              {format(parsedDate, "dd/MM", { locale: ptBR })}
            </p>
            {isToday && (
              <Badge variant="default" className="mt-1">
                Hoje
              </Badge>
            )}
          </div>

          {/* Icone */}
          <div className="rounded-full bg-primary/10 p-4">
            <WeatherIcon className="h-8 w-8 text-primary" />
          </div>

          {/* Condicao */}
          <p className="text-sm text-center text-muted-foreground">
            {weatherInfo.description}
          </p>

          {/* Temperaturas */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-red-500" />
              <span className="font-semibold">{tempMax.toFixed(0)}°</span>
            </div>
            <div className="flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">
                {tempMin.toFixed(0)}°
              </span>
            </div>
          </div>

          {/* Precipitacao */}
          {precipitation > 0 && (
            <div className="flex items-center gap-1 text-sm text-cyan-600">
              <Droplets className="h-4 w-4" />
              <span>{precipitation.toFixed(1)}mm</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ForecastPage() {
  const { location } = useLocation();
  const { data, isLoading } = useWeather(location);

  // Preparar dados para os graficos
  const chartData = data?.daily.time.map((date, index) => ({
    date: format(parseISO(date), "dd/MM", { locale: ptBR }),
    fullDate: format(parseISO(date), "EEEE, dd/MM", { locale: ptBR }),
    maxima: data.daily.temperatureMax[index],
    minima: data.daily.temperatureMin[index],
    precipitacao: data.daily.precipitationSum[index],
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Previsao 15 Dias</h1>
        <p className="text-sm text-muted-foreground">
          Previsao detalhada do tempo
        </p>
      </div>

      {/* Grafico de temperatura */}
      <Card>
        <CardHeader>
          <CardTitle>Variacao de Temperatura</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}°`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="font-medium capitalize">{d.fullDate}</p>
                            <p className="text-sm text-red-500">
                              Maxima: {d.maxima.toFixed(1)}°C
                            </p>
                            <p className="text-sm text-blue-500">
                              Minima: {d.minima.toFixed(1)}°C
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="maxima"
                    name="Maxima (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="minima"
                    name="Minima (°C)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grafico de precipitacao */}
      <Card>
        <CardHeader>
          <CardTitle>Precipitacao Prevista</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}mm`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="font-medium capitalize">{d.fullDate}</p>
                            <p className="text-sm text-cyan-500">
                              Precipitacao: {d.precipitacao.toFixed(1)}mm
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="precipitacao"
                    name="Precipitacao (mm)"
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards de dias */}
      <Card>
        <CardHeader>
          <CardTitle>Previsao Diaria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8">
            {isLoading
              ? Array.from({ length: 15 }).map((_, i) => (
                  <DayCard
                    key={i}
                    date=""
                    tempMax={0}
                    tempMin={0}
                    precipitation={0}
                    weatherCode={0}
                    isLoading
                  />
                ))
              : data?.daily.time.map((date, index) => (
                  <DayCard
                    key={date}
                    date={date}
                    tempMax={data.daily.temperatureMax[index]}
                    tempMin={data.daily.temperatureMin[index]}
                    precipitation={data.daily.precipitationSum[index]}
                    weatherCode={data.daily.weatherCode[index]}
                  />
                ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Periodo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-3">
                  <Thermometer className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Maxima do Periodo</p>
                  <p className="text-xl font-bold">
                    {Math.max(...data.daily.temperatureMax).toFixed(0)}°C
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <Thermometer className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Minima do Periodo</p>
                  <p className="text-xl font-bold">
                    {Math.min(...data.daily.temperatureMin).toFixed(0)}°C
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-cyan-100 p-3">
                  <Droplets className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Precipitacao Total Prevista
                  </p>
                  <p className="text-xl font-bold">
                    {data.daily.precipitationSum
                      .reduce((a, b) => a + b, 0)
                      .toFixed(1)}
                    mm
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
