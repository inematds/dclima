"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CurrentWeather } from "@/types/weather";
import { WEATHER_CODES } from "@/types/weather";
import {
  Thermometer,
  Droplets,
  Wind,
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
} from "lucide-react";

interface KpiCardsProps {
  data?: CurrentWeather;
  isLoading?: boolean;
}

const weatherIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-rain-wind": CloudRain,
  "cloud-snow": CloudSnow,
  "cloud-lightning": CloudLightning,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
};

function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold">
                {value}
                <span className="text-lg font-normal text-muted-foreground">
                  {unit}
                </span>
              </p>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCards({ data, isLoading }: KpiCardsProps) {
  const weatherInfo = data?.weatherCode !== undefined
    ? WEATHER_CODES[data.weatherCode] || { description: "Desconhecido", icon: "cloud" }
    : { description: "Carregando...", icon: "cloud-sun" };

  const WeatherIcon = weatherIcons[weatherInfo.icon] || CloudSun;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Temperatura"
        value={data?.temperature?.toFixed(1) ?? "--"}
        unit="C"
        icon={Thermometer}
        isLoading={isLoading}
      />
      <KpiCard
        title="Sensacao Termica"
        value={data?.apparentTemperature?.toFixed(1) ?? "--"}
        unit="C"
        icon={Thermometer}
        isLoading={isLoading}
      />
      <KpiCard
        title="Umidade"
        value={data?.humidity ?? "--"}
        unit="%"
        icon={Droplets}
        isLoading={isLoading}
      />
      <KpiCard
        title="Vento"
        value={data?.windSpeed?.toFixed(1) ?? "--"}
        unit=" km/h"
        icon={Wind}
        isLoading={isLoading}
      />
      <Card className="md:col-span-2 lg:col-span-4">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full bg-primary/10 p-4">
            <WeatherIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Condicao Atual
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <p className="text-xl font-semibold">{weatherInfo.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
