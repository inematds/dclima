"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Location } from "@/types/weather";
import { DEFAULT_LOCATION } from "@/lib/open-meteo";

const STORAGE_KEY = "weather-dashboard-location";

interface LocationContextType {
  location: Location;
  setLocation: (location: Location) => void;
  isDetecting: boolean;
  detectLocation: () => Promise<void>;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location>(DEFAULT_LOCATION);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar localizacao do localStorage no mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Location;
        setLocationState(parsed);
      } catch {
        // Ignorar erro de parse
      }
    }
    setIsInitialized(true);
  }, []);

  // Detectar localizacao automatica se nao tiver salva
  useEffect(() => {
    if (isInitialized && !localStorage.getItem(STORAGE_KEY)) {
      detectLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  const setLocation = useCallback((newLocation: Location) => {
    setLocationState(newLocation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
    setError(null);
  }, []);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocalizacao nao suportada pelo navegador");
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutos
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Buscar nome da cidade via reverse geocoding
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=pt`
      );

      let cityName = "Sua Localizacao";

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results[0]) {
          const result = data.results[0];
          cityName = result.admin1
            ? `${result.name}, ${result.admin1}`
            : result.name;
        }
      }

      const detectedLocation: Location = {
        id: "detected",
        name: cityName,
        latitude,
        longitude,
        country: "Detectado",
      };

      setLocation(detectedLocation);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Permissao de localizacao negada");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Localizacao indisponivel");
            break;
          case err.TIMEOUT:
            setError("Tempo esgotado ao detectar localizacao");
            break;
        }
      } else {
        setError("Erro ao detectar localizacao");
      }
    } finally {
      setIsDetecting(false);
    }
  }, [setLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        isDetecting,
        detectLocation,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
