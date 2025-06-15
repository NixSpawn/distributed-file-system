"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Files,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { ViewType } from "@/types/types"

interface SidebarProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  onUpload: () => void
  onCreateFolder: () => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

const navigationItems = [
  { id: "grid" as ViewType, label: "Dashboard", icon: HardDrive, color: "text-blue-600" },
  { id: "files" as ViewType, label: "Archivos", icon: Files, color: "text-gray-600" },
  { id: "favorites" as ViewType, label: "Favoritos", icon: Star, color: "text-yellow-500" },
  { id: "shared" as ViewType, label: "Compartidos", icon: Users, color: "text-green-600" },
  { id: "recent" as ViewType, label: "Recientes", icon: Clock, color: "text-purple-600" },
  { id: "trash" as ViewType, label: "Papelera", icon: Trash2, color: "text-red-500" },
]

function SidebarContent({
  currentView,
  onViewChange,
  onUpload,
  onCreateFolder,
  isCollapsed = false,
  onToggleCollapse,
  isMobile = false,
  onMobileClose,
}: {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  onUpload: () => void
  onCreateFolder: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isMobile?: boolean
  onMobileClose?: () => void
}) {
  const handleNavigation = (view: ViewType) => {
    onViewChange(view)
    if (isMobile && onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-100 shadow-sm flex flex-col h-full",
        !isMobile && (isCollapsed ? "w-16" : "w-72"),
        isMobile && "w-full",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">CloudDrive</h1>
          </div>
        )}
        {!isMobile && onToggleCollapse && (
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8 hover:bg-gray-100">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className={cn("px-6 pb-6 space-y-3", !isMobile && isCollapsed && "px-2")}>
        <Button
          onClick={onUpload}
          className={cn(
            "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 hover:shadow-xl",
            !isMobile && isCollapsed ? "w-12 h-12 p-0" : "w-full h-12",
          )}
        >
          <Upload className="h-5 w-5" />
          {(isMobile || !isCollapsed) && <span className="ml-2 font-medium">Subir Archivo</span>}
        </Button>

        <Button
          onClick={onCreateFolder}
          variant="outline"
          className={cn(
            "border-gray-200 hover:bg-gray-50 transition-all duration-200",
            !isMobile && isCollapsed ? "w-12 h-12 p-0" : "w-full h-12",
          )}
        >
          <FolderPlus className="h-5 w-5 text-gray-600" />
          {(isMobile || !isCollapsed) && <span className="ml-2 font-medium text-gray-700">Nueva Carpeta</span>}
        </Button>
      </div>

      {/* Navigation */}
      <div className={cn("flex-1 overflow-y-auto", !isMobile && isCollapsed ? "px-2" : "px-3")}>
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "secondary" : "ghost"}
              className={cn(
                "transition-all duration-200 hover:bg-gray-50",
                !isMobile && isCollapsed ? "w-12 h-12 p-0 justify-center" : "w-full h-11 justify-start",
                currentView === item.id && "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
              )}
              onClick={() => handleNavigation(item.id)}
            >
              <item.icon className={cn("h-5 w-5", item.color)} />
              {(isMobile || !isCollapsed) && <span className="ml-3 font-medium">{item.label}</span>}
            </Button>
          ))}
        </div>
      </div>

      {/* Storage Section */}
      {(isMobile || !isCollapsed) && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Almacenamiento</span>
              <span className="text-gray-900 font-semibold">2.66 GB</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Usado de 300 GB</span>
                <span>0.89%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-[0.89%]"></div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Settings className="h-3 w-3 mr-2" />
              Gestionar Almacenamiento
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Sidebar({
  currentView,
  onViewChange,
  onUpload,
  onCreateFolder,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent
            currentView={currentView}
            onViewChange={onViewChange}
            onUpload={onUpload}
            onCreateFolder={onCreateFolder}
            isMobile={true}
            onMobileClose={() => onMobileOpenChange?.(false)}
          />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <SidebarContent
      currentView={currentView}
      onViewChange={onViewChange}
      onUpload={onUpload}
      onCreateFolder={onCreateFolder}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
    />
  )
}
