"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para icones do Leaflet usando CDN
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface WeatherMapProps {
  center: [number, number];
  zoom?: number;
  owmLayer?: string;
  radarPath?: string | null;
  radarHost?: string;
  height?: string;
}

const OWM_API_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY;

export default function WeatherMap({
  center,
  zoom = 8,
  owmLayer = "precipitation_new",
  radarPath,
  radarHost,
  height = "500px",
}: WeatherMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const owmLayerRef = useRef<L.TileLayer | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Criar mapa
    const map = L.map(containerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Camada base (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Marcador de localizacao
    const marker = L.marker(center).addTo(map);
    marker.bindPopup("Sua localizacao").openPopup();
    markerRef.current = marker;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Atualizar centro do mapa
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.setView(center, mapRef.current.getZoom());

    if (markerRef.current) {
      markerRef.current.setLatLng(center);
    }
  }, [center]);

  // Atualizar camada OWM
  useEffect(() => {
    if (!mapRef.current) return;

    // Remover camada anterior
    if (owmLayerRef.current) {
      mapRef.current.removeLayer(owmLayerRef.current);
      owmLayerRef.current = null;
    }

    // Nao adicionar camada se for "none" ou se nao tiver API key
    if (owmLayer === "none" || !OWM_API_KEY) return;

    // Adicionar nova camada
    const layer = L.tileLayer(
      `https://tile.openweathermap.org/map/${owmLayer}/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`,
      {
        attribution: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>',
        opacity: 0.6,
        maxZoom: 19,
      }
    );

    layer.addTo(mapRef.current);
    owmLayerRef.current = layer;
  }, [owmLayer]);

  // Atualizar camada de radar
  useEffect(() => {
    if (!mapRef.current) return;

    // Remover camada anterior
    if (radarLayerRef.current) {
      mapRef.current.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    // Adicionar nova camada se disponivel
    if (radarPath && radarHost) {
      const layer = L.tileLayer(
        `${radarHost}${radarPath}/256/{z}/{x}/{y}/2/1_1.png`,
        {
          attribution: '&copy; <a href="https://www.rainviewer.com">RainViewer</a>',
          opacity: 0.7,
          maxZoom: 19,
        }
      );

      layer.addTo(mapRef.current);
      radarLayerRef.current = layer;
    }
  }, [radarPath, radarHost]);

  // Atualizar tamanho quando height mudar
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.invalidateSize();
  }, [height]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height, zIndex: 0 }}
    />
  );
}
