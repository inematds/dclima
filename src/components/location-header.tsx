"use client";

import { useLocation } from "@/contexts/location-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchLocations } from "@/lib/open-meteo";
import type { Location } from "@/types/weather";
import { MapPin, Search, Loader2, Navigation } from "lucide-react";
import { useState, useCallback } from "react";
import { MobileMenu } from "@/components/sidebar";

export function LocationHeader() {
  const { location, setLocation, detectLocation, isDetecting } = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (query.length < 2) return;

    setIsSearching(true);
    try {
      const locations = await searchLocations(query);
      setResults(locations);
    } catch (error) {
      console.error("Erro ao buscar localizacoes:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleSelectLocation = (loc: Location) => {
    setLocation(loc);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Menu hamburger - apenas mobile */}
      <MobileMenu />

      <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold truncate">
          {location.name}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
          {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
          {location.country && ` • ${location.country}`}
        </p>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={() => detectLocation()}
          disabled={isDetecting}
          title="Detectar localizacao"
        >
          <Navigation className={`h-4 w-4 ${isDetecting ? "animate-spin" : ""}`} />
        </Button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="sm:w-auto sm:px-3 h-8 w-8 sm:h-9">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">Buscar</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o nome da cidade..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  autoFocus
                />
                <Button
                  size="icon"
                  onClick={handleSearch}
                  disabled={isSearching || query.length < 2}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {results.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {results.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                    >
                      <p className="font-medium">{loc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {loc.country}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {query.length >= 2 && results.length === 0 && !isSearching && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma cidade encontrada
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
