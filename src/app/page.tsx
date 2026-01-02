"use client";

import { useLocation } from "@/contexts/location-context";
import { useWeather } from "@/hooks/use-weather";
import {
  KpiCards,
  TemperatureChart,
  ForecastTable,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPage() {
  const { location } = useLocation();
  const { data, isLoading, isError, error, refetch, dataUpdatedAt } =
    useWeather(location);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento do clima em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dataUpdatedAt > 0 && (
            <span className="text-xs text-muted-foreground">
              Atualizado:{" "}
              {format(new Date(dataUpdatedAt), "HH:mm", { locale: ptBR })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
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

      {/* Chart */}
      <TemperatureChart data={data?.hourly} isLoading={isLoading} />

      {/* Table */}
      <ForecastTable data={data?.hourly} isLoading={isLoading} />
    </div>
  );
}
