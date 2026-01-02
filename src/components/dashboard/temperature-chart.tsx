"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { HourlyForecast } from "@/types/weather";
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
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TemperatureChartProps {
  data?: HourlyForecast;
  isLoading?: boolean;
}

export function TemperatureChart({ data, isLoading }: TemperatureChartProps) {
  // Pega apenas as proximas 24 horas
  const chartData = data?.time.slice(0, 24).map((time, index) => ({
    time: format(parseISO(time), "HH:mm", { locale: ptBR }),
    fullTime: format(parseISO(time), "dd/MM HH:mm", { locale: ptBR }),
    temperatura: data.temperature[index],
    sensacao: data.apparentTemperature[index],
    precipitacao: data.precipitation[index],
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previsao 24 Horas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previsao 24 Horas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}C`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="text-sm font-medium">{data.fullTime}</p>
                        <p className="text-sm text-blue-500">
                          Temperatura: {data.temperatura.toFixed(1)}C
                        </p>
                        <p className="text-sm text-orange-500">
                          Sensacao: {data.sensacao.toFixed(1)}C
                        </p>
                        <p className="text-sm text-cyan-500">
                          Precipitacao: {data.precipitacao.toFixed(1)}mm
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
                dataKey="temperatura"
                name="Temperatura (C)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="sensacao"
                name="Sensacao (C)"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
