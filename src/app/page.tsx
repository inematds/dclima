"use client";

import dynamic from "next/dynamic";
import { useLocation } from "@/contexts/location-context";
import { useWeather } from "@/hooks/use-weather";
import { useRainViewer } from "@/hooks/use-rain-viewer";
import {
  KpiCards,
  TemperatureChart,
  ForecastTable,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertCircle, Radar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const WeatherMap = dynamic(() => import("@/components/weather-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

export default function DashboardPage() {
  const { location } = useLocation();
  const { data, isLoading, isError, error, refetch, dataUpdatedAt } =
    useWeather(location);
  const { data: radarData, isLoading: isLoadingRadar } = useRainViewer();

  // Pegar ultimo frame do radar
  const latestRadar = radarData?.radar?.past?.slice(-1)[0];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Monitoramento do clima em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {dataUpdatedAt > 0 && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Atualizado:{" "}
              {format(new Date(dataUpdatedAt), "HH:mm", { locale: ptBR })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-1 sm:gap-2 h-8 px-2 sm:px-3"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Erro ao carregar dados
              </p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Tente novamente mais tarde"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-auto"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <KpiCards data={data?.current} isLoading={isLoading} />

      {/* Radar de Chuva */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Radar className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-500" />
            Radar de Chuva
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
          {isLoadingRadar ? (
            <Skeleton className="h-[250px] sm:h-[300px] w-full" />
          ) : (
            <WeatherMap
              center={[location.latitude, location.longitude]}
              zoom={7}
              owmLayer="none"
              radarPath={latestRadar?.path}
              radarHost={radarData?.host}
              height="250px"
            />
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      <TemperatureChart data={data?.hourly} isLoading={isLoading} />

      {/* Table */}
      <ForecastTable data={data?.hourly} isLoading={isLoading} />
    </div>
  );
}
