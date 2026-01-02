"use client";

import { useLocation } from "@/contexts/location-context";
import { useHistoricalWeather } from "@/hooks/use-historical-weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { TrendingUp, TrendingDown, Droplets } from "lucide-react";

export default function HistoryPage() {
  const { location } = useLocation();
  const { data, isLoading, isError } = useHistoricalWeather(location, 7);

  const chartData = data?.map((day) => ({
    date: format(parseISO(day.date), "dd/MM", { locale: ptBR }),
    fullDate: format(parseISO(day.date), "EEEE, dd/MM", { locale: ptBR }),
    maxima: day.temperatureMax,
    minima: day.temperatureMin,
    precipitacao: day.precipitationSum,
  }));

  // Calcular estatisticas
  const stats = data
    ? {
        avgMax:
          data.reduce((sum, d) => sum + d.temperatureMax, 0) / data.length,
        avgMin:
          data.reduce((sum, d) => sum + d.temperatureMin, 0) / data.length,
        totalPrecip: data.reduce((sum, d) => sum + d.precipitationSum, 0),
        maxTemp: Math.max(...data.map((d) => d.temperatureMax)),
        minTemp: Math.min(...data.map((d) => d.temperatureMin)),
      }
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Historico</h1>
        <p className="text-sm text-muted-foreground">
          Ultimos 7 dias em {location.name}
        </p>
      </div>

      {isError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-destructive">
              Erro ao carregar dados historicos. A API de historico pode estar
              indisponivel.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estatisticas */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Media Maxima
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.avgMax.toFixed(1)}°C
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Media Minima
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.avgMin.toFixed(1)}°C
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Droplets className="h-8 w-8 text-cyan-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Precipitacao Total
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.totalPrecip.toFixed(1)}mm
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground">
                      Amplitude Termica
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.minTemp.toFixed(0)}° a {stats.maxTemp.toFixed(0)}°
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

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
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
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
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="minima"
                    name="Minima (°C)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
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
          <CardTitle>Precipitacao</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
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

      {/* Tabela detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Condicao</TableHead>
                    <TableHead>Maxima</TableHead>
                    <TableHead>Minima</TableHead>
                    <TableHead>Precipitacao</TableHead>
                    <TableHead>Vento Max</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.map((day) => {
                    const weatherInfo = WEATHER_CODES[day.weatherCode] || {
                      description: "Desconhecido",
                    };
                    return (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium">
                          {format(parseISO(day.date), "EEEE, dd/MM", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {weatherInfo.description}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-red-600">
                          {day.temperatureMax.toFixed(1)}°C
                        </TableCell>
                        <TableCell className="text-blue-600">
                          {day.temperatureMin.toFixed(1)}°C
                        </TableCell>
                        <TableCell>
                          {day.precipitationSum > 0 ? (
                            <span className="text-cyan-600">
                              {day.precipitationSum.toFixed(1)}mm
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0mm</span>
                          )}
                        </TableCell>
                        <TableCell>{day.windSpeedMax.toFixed(1)} km/h</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
