"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  History,
  Map,
  Settings,
  CloudSun,
  GitCompare,
  Target,
  Menu,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Previsao 15 Dias", href: "/forecast", icon: Calendar },
  { name: "Previsibilidade", href: "/models", icon: GitCompare },
  { name: "Acertividade", href: "/accuracy", icon: Target },
  { name: "Historico 30 Dias", href: "/history", icon: History },
  { name: "Mapa", href: "/map", icon: Map },
];

const bottomNav = [
  { name: "Configuracoes", href: "/settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <a
        href="https://inema.club"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-16 items-center gap-2 px-6 hover:opacity-80 transition-opacity"
      >
        <CloudSun className="h-6 w-6 text-primary" />
        <div className="flex flex-col">
          <span className="text-lg font-bold text-primary">DClima</span>
          <span className="text-xs text-muted-foreground">INEMA.CLUB</span>
        </div>
      </a>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom navigation */}
      <nav className="space-y-1 px-3 py-4">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

// Sidebar para desktop (fixa)
export function Sidebar() {
  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
      <SidebarContent />
    </aside>
  );
}

// Menu mobile (hamburger)
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
