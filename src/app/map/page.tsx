"use client";

import { useLocation } from "@/contexts/location-context";
import { useRainViewer } from "@/hooks/use-rain-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers, RefreshCw, Play, Pause, Maximize2, Minimize2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";

const MAP_SIZES = {
  normal: "h-[400px]",
  grande: "h-[600px]",
  enorme: "h-[800px]",
  tela_cheia: "fixed inset-0 z-50 h-screen",
} as const;

// Importar o mapa dinamicamente para evitar SSR issues
const WeatherMap = dynamic(() => import("@/components/weather-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-lg" />,
});

const OWM_LAYERS = [
  { id: "temp_new", name: "Temperatura", color: "text-red-500" },
  { id: "precipitation_new", name: "Precipitacao", color: "text-cyan-500" },
  { id: "clouds_new", name: "Nuvens", color: "text-gray-500" },
  { id: "wind_new", name: "Vento", color: "text-green-500" },
  { id: "pressure_new", name: "Pressao", color: "text-purple-500" },
  { id: "none", name: "Nenhuma", color: "text-muted-foreground" },
] as const;

export default function MapPage() {
  const { location } = useLocation();
  const { data: rainData, isLoading: rainLoading, refetch } = useRainViewer();

  const [selectedLayer, setSelectedLayer] = useState<string>("precipitation_new");
  const [showRadar, setShowRadar] = useState(true);
  const [radarFrame, setRadarFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mapSize, setMapSize] = useState<keyof typeof MAP_SIZES>("normal");

  const isFullscreen = mapSize === "tela_cheia";

  // Animacao do radar
  useEffect(() => {
    if (!isPlaying || !rainData?.radar?.past) return;

    const interval = setInterval(() => {
      setRadarFrame((prev) => {
        const maxFrames = rainData.radar.past.length + (rainData.radar.nowcast?.length || 0);
        return (prev + 1) % maxFrames;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, rainData]);

  const getCurrentRadarPath = useCallback(() => {
    if (!rainData?.radar) return null;

    const pastFrames = rainData.radar.past || [];
    const nowcastFrames = rainData.radar.nowcast || [];
    const allFrames = [...pastFrames, ...nowcastFrames];

    if (radarFrame >= allFrames.length) return null;
    return allFrames[radarFrame]?.path;
  }, [rainData, radarFrame]);

  const getRadarTimestamp = useCallback(() => {
    if (!rainData?.radar) return null;

    const pastFrames = rainData.radar.past || [];
    const nowcastFrames = rainData.radar.nowcast || [];
    const allFrames = [...pastFrames, ...nowcastFrames];

    if (radarFrame >= allFrames.length) return null;

    const timestamp = allFrames[radarFrame]?.time;
    if (!timestamp) return null;

    const date = new Date(timestamp * 1000);
    const isNowcast = radarFrame >= pastFrames.length;

    return {
      time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      isNowcast,
    };
  }, [rainData, radarFrame]);

  const radarPath = getCurrentRadarPath();
  const radarTimestamp = getRadarTimestamp();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mapa Meteorologico</h1>
          <p className="text-sm text-muted-foreground">
            Visualizacao de camadas e radar
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor de camada */}
          <Select value={selectedLayer} onValueChange={setSelectedLayer}>
            <SelectTrigger className="w-[160px]">
              <Layers className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OWM_LAYERS.map((layer) => (
                <SelectItem key={layer.id} value={layer.id}>
                  {layer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Toggle radar */}
          <Button
            variant={showRadar ? "default" : "outline"}
            size="sm"
            onClick={() => setShowRadar(!showRadar)}
          >
            Radar
          </Button>

          {/* Tamanho do mapa */}
          <Select value={mapSize} onValueChange={(v) => setMapSize(v as keyof typeof MAP_SIZES)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="grande">Grande</SelectItem>
              <SelectItem value="enorme">Enorme</SelectItem>
            </SelectContent>
          </Select>

          {/* Tela cheia */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapSize(isFullscreen ? "normal" : "tela_cheia")}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          {/* Atualizar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={rainLoading}
          >
            <RefreshCw className={`h-4 w-4 ${rainLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Mapa */}
      <div className={isFullscreen ? MAP_SIZES.tela_cheia : ""}>
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-[1000] flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMapSize("normal")}
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Sair da tela cheia
            </Button>
          </div>
        )}
        <Card className={isFullscreen ? "h-full rounded-none" : ""}>
          <CardContent className={`p-0 overflow-hidden ${isFullscreen ? "h-full" : "rounded-lg"}`}>
            <WeatherMap
              center={[location.latitude, location.longitude]}
              zoom={8}
              owmLayer={selectedLayer}
              radarPath={showRadar ? radarPath : null}
              radarHost={rainData?.host}
              height={isFullscreen ? "100%" : MAP_SIZES[mapSize].replace("h-[", "").replace("]", "")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Controles do Radar */}
      {showRadar && rainData?.radar && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Radar de Precipitacao
              {radarTimestamp && (
                <Badge variant={radarTimestamp.isNowcast ? "secondary" : "outline"}>
                  {radarTimestamp.isNowcast ? "Previsao" : "Observado"} - {radarTimestamp.time}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              {/* Slider */}
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={(rainData.radar.past?.length || 0) + (rainData.radar.nowcast?.length || 0) - 1}
                  value={radarFrame}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setRadarFrame(Number(e.target.value));
                  }}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Passado</span>
                  <span>Agora</span>
                  <span>Previsao</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Camadas Disponiveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {OWM_LAYERS.map((layer) => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                    selectedLayer === layer.id
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedLayer(layer.id)}
                >
                  <div className={`w-3 h-3 rounded-full ${layer.color} bg-current`} />
                  <span className="text-sm">{layer.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sobre os Dados</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Camadas:</strong> Dados de OpenWeatherMap atualizados em tempo real.
            </p>
            <p>
              <strong>Radar:</strong> Dados de RainViewer com historico de 2 horas e
              previsao de 30 minutos.
            </p>
            <p>
              Use os controles para animar o radar e ver a evolucao da precipitacao.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
