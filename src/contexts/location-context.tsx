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

      // Buscar nome da cidade via reverse geocoding (Nominatim/OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt`,
        {
          headers: {
            "User-Agent": "DClima Weather Dashboard",
          },
        }
      );

      let cityName = "Sua Localizacao";
      let country = "Detectado";

      if (response.ok) {
        const data = await response.json();
        if (data.address) {
          const addr = data.address;
          // Tentar pegar cidade, ou municipio, ou estado
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county;
          const state = addr.state;

          if (city && state) {
            cityName = `${city}, ${state}`;
          } else if (city) {
            cityName = city;
          } else if (state) {
            cityName = state;
          }

          country = addr.country || "Detectado";
        }
      }

      const detectedLocation: Location = {
        id: "detected",
        name: cityName,
        latitude,
        longitude,
        country,
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
