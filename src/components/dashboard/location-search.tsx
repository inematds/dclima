"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchLocations } from "@/lib/open-meteo";
import type { Location } from "@/types/weather";
import { MapPin, Search, Loader2 } from "lucide-react";

interface LocationSearchProps {
  currentLocation: Location;
  onLocationChange: (location: Location) => void;
}

export function LocationSearch({
  currentLocation,
  onLocationChange,
}: LocationSearchProps) {
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

  const handleSelectLocation = (location: Location) => {
    onLocationChange(location);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" />
          {currentLocation.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar cidade..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
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
              {results.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelectLocation(location)}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                >
                  <p className="font-medium">{location.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {location.country}
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
  );
}
