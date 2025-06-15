"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Grid3X3, List, Settings, LogOut, User, Menu } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { ViewType } from "@/types/types"

type TopBarProps = {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onMobileMenuOpen?: () => void
}

export function TopBar({ currentView, onViewChange, searchQuery, onSearchChange, onMobileMenuOpen }: TopBarProps) {
  const isMobile = useIsMobile()

  const getViewTitle = () => {
    switch (currentView) {
      case "grid":
        return "Dashboard"
      case "files":
        return "Archivos"
      case "favorites":
        return "Favoritos"
      case "shared":
        return "Compartidos"
      case "recent":
        return "Recientes"
      case "trash":
        return "Papelera"
      case "search":
        return "Búsqueda"
      default:
        return "Dashboard"
    }
  }

  const getViewDescription = () => {
    switch (currentView) {
      case "grid":
        return "Gestiona tus archivos y carpetas"
      case "files":
        return "Todos tus archivos y carpetas"
      case "favorites":
        return "Tus elementos favoritos"
      case "shared":
        return "Elementos compartidos contigo"
      case "recent":
        return "Archivos accedidos recientemente"
      case "trash":
        return "Elementos eliminados"
      case "search":
        return "Resultados de búsqueda"
      default:
        return "Gestiona tus archivos y carpetas"
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 md:px-8 py-4 md:py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-6 flex-1">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onMobileMenuOpen} className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <div className="min-w-0">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{getViewTitle()}</h2>
            {!isMobile && <p className="text-sm text-gray-500 mt-1">{getViewDescription()}</p>}
          </div>

          <div className="relative flex-1 max-w-sm md:max-w-lg">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
            <Input
              placeholder={isMobile ? "Buscar..." : "Buscar archivos, carpetas..."}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 md:pl-12 h-10 md:h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all duration-200 text-sm md:text-base"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {!isMobile && (
            <div className="flex items-center bg-gray-50 rounded-xl p-1.5 border border-gray-200">
              <Button
                variant={currentView === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("grid")}
                className={cn(
                  "h-9 w-9 p-0 rounded-lg transition-all duration-200",
                  currentView === "grid" && "bg-white shadow-sm",
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={currentView === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("list")}
                className={cn(
                  "h-9 w-9 p-0 rounded-lg transition-all duration-200",
                  currentView === "list" && "bg-white shadow-sm",
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-gray-100">
                <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-gray-200">
                  <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs md:text-sm">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="h-10">
                <User className="mr-3 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="h-10">
                <Settings className="mr-3 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="h-10 text-red-600">
                <LogOut className="mr-3 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
