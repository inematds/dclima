"use client";

import { useLocation } from "@/contexts/location-context";
import { useEnsembleWithPast, useObservedData } from "@/hooks/use-ensemble";
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
} from "recharts";
import { CloudRain, Thermometer, Info, CheckCircle2, Target } from "lucide-react";

export default function AccuracyPage() {
  const { location } = useLocation();
  const { data, isLoading, isError } = useEnsembleWithPast(location);
  const { data: observedData } = useObservedData(location, 14);

  // Preparar dados para graficos
  const chartData = data && data.length > 0
    ? data[0].daily.time.map((date, index) => {
        const entry: Record<string, string | number | null> = {
          date: format(parseISO(date), "dd/MM", { locale: ptBR }),
          fullDate: format(parseISO(date), "EEEE, dd/MM", { locale: ptBR }),
          rawDate: date,
        };

        // Adicionar dados de cada modelo
        data.forEach((model) => {
          entry[`precip_${model.model}`] = model.daily.precipitation_sum[index] || 0;
          entry[`temp_max_${model.model}`] = model.daily.temperature_2m_max[index] || 0;
          entry[`temp_min_${model.model}`] = model.daily.temperature_2m_min[index] || 0;
        });

        // Adicionar dados observados se disponivel
        if (observedData) {
          const obsIndex = observedData.time.indexOf(date);
          if (obsIndex !== -1) {
            entry.observed_precip = observedData.precipitation_sum[obsIndex];
            entry.observed_temp_max = observedData.temperature_2m_max[obsIndex];
            entry.observed_temp_min = observedData.temperature_2m_min[obsIndex];
          } else {
            entry.observed_precip = null;
            entry.observed_temp_max = null;
            entry.observed_temp_min = null;
          }
        }

        return entry;
      })
    : [];

  // Calcular erros de cada modelo (MAE - Mean Absolute Error)
  const modelErrors = data?.map((model) => {
    if (!observedData) return null;

    let precipError = 0;
    let tempMaxError = 0;
    let count = 0;

    observedData.time.forEach((obsDate, obsIndex) => {
      const modelIndex = model.daily.time.indexOf(obsDate);
      if (modelIndex !== -1) {
        const obsPrecip = observedData.precipitation_sum[obsIndex] || 0;
        const obsTempMax = observedData.temperature_2m_max[obsIndex] || 0;
        const modelPrecip = model.daily.precipitation_sum[modelIndex] || 0;
        const modelTempMax = model.daily.temperature_2m_max[modelIndex] || 0;

        precipError += Math.abs(modelPrecip - obsPrecip);
        tempMaxError += Math.abs(modelTempMax - obsTempMax);
        count++;
      }
    });

    if (count === 0) return null;

    return {
      model: model.model,
      modelName: model.modelName,
      color: model.color,
      precipMAE: precipError / count,
      tempMAE: tempMaxError / count,
      count,
    };
  }).filter(Boolean);

  // Ordenar por menor erro de precipitacao
  const rankedModels = modelErrors?.sort((a, b) => (a?.precipMAE || 0) - (b?.precipMAE || 0));

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Acertividade dos Modelos</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Comparando previsoes passadas com o que realmente aconteceu
        </p>
      </div>

      {/* Info sobre modelos */}
      <Card className="bg-muted/50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Modelos:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 sm:gap-2">
                {ENSEMBLE_MODELS.map((model) => (
                  <div key={model.id} className="flex items-center gap-1 sm:gap-2">
                    <div
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: model.color }}
                    />
                    <span className="truncate">
                      <strong>{model.name}</strong>
                      <span className="hidden sm:inline"> - {model.description}</span>
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

      {/* Ranking de Precisao dos Modelos */}
      {rankedModels && rankedModels.length > 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Ranking ({rankedModels[0]?.count} dias)
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Menor erro = mais preciso
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
              {rankedModels.map((model, index) => (
                <div
                  key={model?.model}
                  className={`p-2 sm:p-3 rounded-lg border ${
                    index === 0
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <span className="text-sm sm:text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                      style={{ backgroundColor: model?.color }}
                    />
                    <span className="font-medium text-xs sm:text-sm truncate">{model?.modelName}</span>
                    {index === 0 && (
                      <Badge variant="default" className="bg-green-500 text-[10px] sm:text-xs px-1 hidden sm:inline-flex">
                        Melhor
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">
                    <p>Precip: <span className="text-foreground font-medium">{model?.precipMAE.toFixed(1)}mm</span></p>
                    <p>Temp: <span className="text-foreground font-medium">{model?.tempMAE.toFixed(1)}°C</span></p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grafico de Precipitacao com Observado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-cyan-500" />
            Precipitacao: Previsao vs Real
          </CardTitle>
          <CardDescription>
            Linha preta tracejada = o que realmente choveu
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
                    interval={1}
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
                            {d.observed_precip !== null && d.observed_precip !== undefined && (
                              <p className="text-sm font-bold border-b pb-2 mb-2 text-green-600">
                                Real: {d.observed_precip?.toFixed(1)}mm
                              </p>
                            )}
                            {data?.map((model) => (
                              <p
                                key={model.model}
                                className="text-sm"
                                style={{ color: model.color }}
                              >
                                {model.modelName}: {d[`precip_${model.model}`]?.toFixed(1)}mm
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
                      dataKey={`precip_${model.model}`}
                      name={model.modelName}
                      stroke={model.color}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  ))}
                  {observedData && (
                    <Line
                      type="monotone"
                      dataKey="observed_precip"
                      name="Real (Observado)"
                      stroke="#000000"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: "#000000" }}
                      connectNulls={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grafico de Temperatura com Observado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-red-500" />
            Temperatura Maxima: Previsao vs Real
          </CardTitle>
          <CardDescription>
            Linha preta tracejada = temperatura real medida
          </CardDescription>
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
                    interval={1}
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
                            {d.observed_temp_max !== null && d.observed_temp_max !== undefined && (
                              <p className="text-sm font-bold border-b pb-2 mb-2 text-green-600">
                                Real: {d.observed_temp_max?.toFixed(1)}°C
                              </p>
                            )}
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
                  {observedData && (
                    <Line
                      type="monotone"
                      dataKey="observed_temp_max"
                      name="Real (Observado)"
                      stroke="#000000"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: "#000000" }}
                      connectNulls={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Erros Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento dos Erros</CardTitle>
          <CardDescription>
            MAE = Erro Medio Absoluto (menor = melhor)
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
                    <TableHead>Posicao</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead className="text-right">Erro Precip (MAE)</TableHead>
                    <TableHead className="text-right">Erro Temp (MAE)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankedModels?.map((model, index) => {
                    const modelInfo = ENSEMBLE_MODELS.find((m) => m.id === model?.model);
                    return (
                      <TableRow key={model?.model} className={index === 0 ? "bg-green-500/5" : ""}>
                        <TableCell>
                          <span className={`font-bold ${index === 0 ? "text-green-600" : "text-muted-foreground"}`}>
                            #{index + 1}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: model?.color }}
                            />
                            <span className="font-medium">{model?.modelName}</span>
                            {index === 0 && (
                              <Badge variant="default" className="bg-green-500 text-xs">
                                Melhor
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {modelInfo?.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-cyan-600">
                            {model?.precipMAE.toFixed(2)}mm
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-red-600">
                            {model?.tempMAE.toFixed(2)}°C
                          </Badge>
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
