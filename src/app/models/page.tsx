"use client";

import { useLocation } from "@/contexts/location-context";
import { useEnsembleComparison } from "@/hooks/use-ensemble";
import { ENSEMBLE_MODELS } from "@/lib/weather-apis";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Area,
  AreaChart,
} from "recharts";
import { CloudRain, Thermometer, Info } from "lucide-react";

export default function ModelsPage() {
  const { location } = useLocation();
  const { data, isLoading, isError } = useEnsembleComparison(location);

  // Preparar dados para graficos
  const chartData = data && data.length > 0
    ? data[0].daily.time.map((date, index) => {
        const entry: Record<string, string | number> = {
          date: format(parseISO(date), "dd/MM", { locale: ptBR }),
          fullDate: format(parseISO(date), "EEEE, dd/MM", { locale: ptBR }),
        };

        // Adicionar dados de cada modelo
        data.forEach((model) => {
          entry[`precip_${model.model}`] = model.daily.precipitation_sum[index] || 0;
          entry[`temp_max_${model.model}`] = model.daily.temperature_2m_max[index] || 0;
          entry[`temp_min_${model.model}`] = model.daily.temperature_2m_min[index] || 0;
        });

        // Calcular media e min/max para faixa de incerteza
        const precipValues = data.map(m => m.daily.precipitation_sum[index] || 0);
        const tempMaxValues = data.map(m => m.daily.temperature_2m_max[index] || 0);

        entry.precip_media = precipValues.reduce((a, b) => a + b, 0) / precipValues.length;
        entry.precip_min = Math.min(...precipValues);
        entry.precip_max = Math.max(...precipValues);
        entry.temp_media = tempMaxValues.reduce((a, b) => a + b, 0) / tempMaxValues.length;
        entry.temp_min_range = Math.min(...tempMaxValues);
        entry.temp_max_range = Math.max(...tempMaxValues);

        return entry;
      })
    : [];

  // Calcular estatisticas por modelo
  const modelStats = data?.map((model) => {
    const totalPrecip = model.daily.precipitation_sum.reduce((a, b) => a + b, 0);
    const avgMax = model.daily.temperature_2m_max.reduce((a, b) => a + b, 0) / model.daily.temperature_2m_max.length;
    const avgMin = model.daily.temperature_2m_min.reduce((a, b) => a + b, 0) / model.daily.temperature_2m_min.length;

    return {
      ...model,
      totalPrecip,
      avgMax,
      avgMin,
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Comparacao de Modelos</h1>
        <p className="text-sm text-muted-foreground">
          Previsao de 16 dias usando multiplos modelos meteorologicos
        </p>
      </div>

      {/* Info sobre modelos */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Sobre os modelos:</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {ENSEMBLE_MODELS.map((model) => (
                  <div key={model.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: model.color }}
                    />
                    <span>
                      <strong>{model.name}</strong> - {model.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-destructive">
              Erro ao carregar dados dos modelos. Tente novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grafico de Precipitacao - Comparacao */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-cyan-500" />
            Precipitacao - Comparacao entre Modelos
          </CardTitle>
          <CardDescription>
            Cada linha representa a previsao de um modelo diferente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <div className="h-[350px]">
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
                    tickFormatter={(v) => `${v}mm`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="font-medium capitalize mb-2">{d.fullDate}</p>
                            {data?.map((model) => (
                              <p
                                key={model.model}
                                className="text-sm"
                                style={{ color: model.color }}
                              >
                                {model.modelName}: {d[`precip_${model.model}`]?.toFixed(1)}mm
                              </p>
                            ))}
                            <p className="text-sm font-medium mt-2 border-t pt-2">
                              Media: {d.precip_media?.toFixed(1)}mm
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {data?.map((model) => (
                    <Line
                      key={model.model}
                      type="monotone"
                      dataKey={`precip_${model.model}`}
                      name={model.modelName}
                      stroke={model.color}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grafico de Incerteza */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-cyan-500" />
            Faixa de Incerteza - Precipitacao
          </CardTitle>
          <CardDescription>
            Area sombreada mostra a variacao entre modelos (min/max)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                              Media: {d.precip_media?.toFixed(1)}mm
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Faixa: {d.precip_min?.toFixed(1)} - {d.precip_max?.toFixed(1)}mm
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="precip_max"
                    stroke="transparent"
                    fill="#06b6d4"
                    fillOpacity={0.2}
                    name="Maximo"
                  />
                  <Area
                    type="monotone"
                    dataKey="precip_min"
                    stroke="transparent"
                    fill="#ffffff"
                    fillOpacity={1}
                    name="Minimo"
                  />
                  <Line
                    type="monotone"
                    dataKey="precip_media"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Media"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grafico de Temperatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-red-500" />
            Temperatura Maxima - Comparacao
          </CardTitle>
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
                            <p className="font-medium capitalize mb-2">{d.fullDate}</p>
                            {data?.map((model) => (
                              <p
                                key={model.model}
                                className="text-sm"
                                style={{ color: model.color }}
                              >
                                {model.modelName}: {d[`temp_max_${model.model}`]?.toFixed(1)}°C
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {data?.map((model) => (
                    <Line
                      key={model.model}
                      type="monotone"
                      dataKey={`temp_max_${model.model}`}
                      name={model.modelName}
                      stroke={model.color}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela resumo por modelo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Modelo</CardTitle>
          <CardDescription>
            Totais e medias para os proximos 16 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead className="text-right">Precip. Total</TableHead>
                    <TableHead className="text-right">Temp. Max Media</TableHead>
                    <TableHead className="text-right">Temp. Min Media</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelStats?.map((model) => {
                    const modelInfo = ENSEMBLE_MODELS.find((m) => m.id === model.model);
                    return (
                      <TableRow key={model.model}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: model.color }}
                            />
                            <span className="font-medium">{model.modelName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {modelInfo?.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-cyan-600">
                            {model.totalPrecip.toFixed(1)}mm
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {model.avgMax.toFixed(1)}°C
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {model.avgMin.toFixed(1)}°C
                        </TableCell>
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
