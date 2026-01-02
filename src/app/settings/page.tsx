"use client";

import { useState, useEffect } from "react";
import { useLocation } from "@/contexts/location-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Thermometer,
  Wind,
  RefreshCw,
  Check,
  Trash2,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";

interface Settings {
  temperatureUnit: "celsius" | "fahrenheit";
  windSpeedUnit: "kmh" | "mph" | "ms";
  autoDetectLocation: boolean;
  refreshInterval: number;
}

const DEFAULT_SETTINGS: Settings = {
  temperatureUnit: "celsius",
  windSpeedUnit: "kmh",
  autoDetectLocation: true,
  refreshInterval: 5,
};

export default function SettingsPage() {
  const { location, detectLocation, isDetecting, error } = useLocation();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  // Carregar configuracoes do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("weather-settings");
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch {
        // Ignorar erro de parse
      }
    }
  }, []);

  // Salvar configuracoes
  const saveSettings = () => {
    localStorage.setItem("weather-settings", JSON.stringify(settings));
    setSaved(true);
    toast.success("Configuracoes salvas!");
    setTimeout(() => setSaved(false), 2000);
  };

  // Limpar dados
  const clearData = () => {
    localStorage.removeItem("weather-location");
    localStorage.removeItem("weather-settings");
    setSettings(DEFAULT_SETTINGS);
    toast.success("Dados limpos! Recarregue a pagina.");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configuracoes</h1>
        <p className="text-sm text-muted-foreground">
          Personalize sua experiencia no dashboard
        </p>
      </div>

      {/* Localizacao */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localizacao
          </CardTitle>
          <CardDescription>
            Gerencie sua localizacao atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{location.name}</p>
              <p className="text-sm text-muted-foreground">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
            </div>
            <Badge variant="outline">Atual</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Detectar localizacao automaticamente</p>
              <p className="text-sm text-muted-foreground">
                Usar GPS do dispositivo ao carregar o app
              </p>
            </div>
            <Button
              variant={settings.autoDetectLocation ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSettings((s) => ({ ...s, autoDetectLocation: !s.autoDetectLocation }))
              }
            >
              {settings.autoDetectLocation ? "Ativado" : "Desativado"}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => detectLocation()}
            disabled={isDetecting}
            className="w-full"
          >
            <Navigation className={`h-4 w-4 mr-2 ${isDetecting ? "animate-spin" : ""}`} />
            {isDetecting ? "Detectando..." : "Detectar Localizacao Agora"}
          </Button>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Unidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Unidades de Medida
          </CardTitle>
          <CardDescription>
            Escolha as unidades para temperatura e vento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Temperatura</p>
              <p className="text-sm text-muted-foreground">
                Unidade para exibir temperaturas
              </p>
            </div>
            <Select
              value={settings.temperatureUnit}
              onValueChange={(v) =>
                setSettings((s) => ({ ...s, temperatureUnit: v as "celsius" | "fahrenheit" }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">Celsius (C)</SelectItem>
                <SelectItem value="fahrenheit">Fahrenheit (F)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Velocidade do Vento</p>
                <p className="text-sm text-muted-foreground">
                  Unidade para velocidade do vento
                </p>
              </div>
            </div>
            <Select
              value={settings.windSpeedUnit}
              onValueChange={(v) =>
                setSettings((s) => ({ ...s, windSpeedUnit: v as "kmh" | "mph" | "ms" }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kmh">km/h</SelectItem>
                <SelectItem value="mph">mph</SelectItem>
                <SelectItem value="ms">m/s</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Atualizacao */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Atualizacao Automatica
          </CardTitle>
          <CardDescription>
            Intervalo para atualizar dados meteorologicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Intervalo de Atualizacao</p>
              <p className="text-sm text-muted-foreground">
                Com que frequencia buscar novos dados
              </p>
            </div>
            <Select
              value={settings.refreshInterval.toString()}
              onValueChange={(v) =>
                setSettings((s) => ({ ...s, refreshInterval: Number(v) }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minuto</SelectItem>
                <SelectItem value="5">5 minutos</SelectItem>
                <SelectItem value="10">10 minutos</SelectItem>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Acoes */}
      <Card>
        <CardHeader>
          <CardTitle>Dados e Armazenamento</CardTitle>
          <CardDescription>
            Gerencie os dados armazenados localmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Limpar Todos os Dados</p>
              <p className="text-sm text-muted-foreground">
                Remove localizacao e configuracoes salvas
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearData}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botao Salvar */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg">
          <Check className="h-4 w-4 mr-2" />
          {saved ? "Salvo!" : "Salvar Configuracoes"}
        </Button>
      </div>

      {/* Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> As preferencias de unidades serao aplicadas em
            uma versao futura. Atualmente todos os dados sao exibidos em unidades
            metricas (Celsius, km/h).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
