"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HourlyForecast } from "@/types/weather";
import { WEATHER_CODES } from "@/types/weather";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface ForecastTableProps {
  data?: HourlyForecast;
  isLoading?: boolean;
}

type SortKey = "time" | "temperature" | "precipitation" | "windSpeed";
type SortOrder = "asc" | "desc";

const PAGE_SIZE = 12;

export function ForecastTable({ data, isLoading }: ForecastTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [page, setPage] = useState(0);
  const [filterPeriod, setFilterPeriod] = useState<"24h" | "48h" | "7d">("24h");

  const periodHours = {
    "24h": 24,
    "48h": 48,
    "7d": 168,
  };

  const tableData = useMemo(() => {
    if (!data) return [];

    const hours = periodHours[filterPeriod];
    const rows = data.time.slice(0, hours).map((time, index) => ({
      time,
      temperature: data.temperature[index],
      apparentTemperature: data.apparentTemperature[index],
      humidity: data.humidity[index],
      precipitation: data.precipitation[index],
      windSpeed: data.windSpeed[index],
      weatherCode: data.weatherCode[index],
    }));

    return rows.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [data, sortKey, sortOrder, filterPeriod]);

  const paginatedData = useMemo(() => {
    const start = page * PAGE_SIZE;
    return tableData.slice(start, start + PAGE_SIZE);
  }, [tableData, page]);

  const totalPages = Math.ceil(tableData.length / PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setPage(0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previsao Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Previsao Detalhada</CardTitle>
        <Select
          value={filterPeriod}
          onValueChange={(value: "24h" | "48h" | "7d") => {
            setFilterPeriod(value);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 horas</SelectItem>
            <SelectItem value="48h">48 horas</SelectItem>
            <SelectItem value="7d">7 dias</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("time")}
                    className="gap-1"
                  >
                    Horario
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("temperature")}
                    className="gap-1"
                  >
                    Temp.
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Sensacao</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("precipitation")}
                    className="gap-1"
                  >
                    Chuva
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("windSpeed")}
                    className="gap-1"
                  >
                    Vento
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Umidade</TableHead>
                <TableHead>Condicao</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => {
                const weatherInfo = WEATHER_CODES[row.weatherCode] || {
                  description: "Desconhecido",
                };
                return (
                  <TableRow key={row.time}>
                    <TableCell className="font-medium">
                      {format(parseISO(row.time), "dd/MM HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>{row.temperature.toFixed(1)}C</TableCell>
                    <TableCell>{row.apparentTemperature.toFixed(1)}C</TableCell>
                    <TableCell>
                      {row.precipitation > 0 ? (
                        <Badge variant="secondary">
                          {row.precipitation.toFixed(1)}mm
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0mm</span>
                      )}
                    </TableCell>
                    <TableCell>{row.windSpeed.toFixed(1)} km/h</TableCell>
                    <TableCell>{row.humidity}%</TableCell>
                    <TableCell>
                      <Badge variant="outline">{weatherInfo.description}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {page * PAGE_SIZE + 1} a{" "}
            {Math.min((page + 1) * PAGE_SIZE, tableData.length)} de{" "}
            {tableData.length} registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Pagina {page + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
