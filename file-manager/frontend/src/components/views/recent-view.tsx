"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Download, Share2, Star, Trash2, Eye, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileItem } from "@/types/types"

interface RecentViewProps {
  files: FileItem[]
  onFileSelect: (file: FileItem) => void
  onFilePreview: (file: FileItem) => void
  onFileShare: (file: FileItem) => void
}

// Obtener iconos y colores para los archivos
const getFileIcon = (type: string) => {
  switch (type) {
    case "folder":
      return "📁"
    case "image":
      return "🏔️"
    case "document":
      return "📄"
    case "video":
      return "🎥"
    case "audio":
      return "🎵"
    default:
      return "📄"
  }
}

const getFileColor = (type: string) => {
  switch (type) {
    case "folder":
      return "from-orange-400 to-orange-500"
    case "image":
      return "from-green-400 to-green-500"
    case "document":
      return "from-blue-400 to-blue-500"
    case "video":
      return "from-purple-400 to-purple-500"
    case "audio":
      return "from-orange-400 to-red-500"
    default:
      return "from-gray-400 to-gray-500"
  }
}

// Función para formatear la fecha relativa
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "Hoy"
  if (diffInDays === 1) return "Ayer"
  if (diffInDays < 7) return `Hace ${diffInDays} días`
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`
  return `Hace ${Math.floor(diffInDays / 30)} meses`
}

// Agrupar archivos por fecha de acceso
const groupFilesByAccessDate = (files: FileItem[]) => {
  const groups: Record<string, FileItem[]> = {}

  files.forEach((file) => {
    const date = file.lastAccessed || file.modified
    const relativeTime = getRelativeTime(date)

    if (!groups[relativeTime]) {
      groups[relativeTime] = []
    }

    groups[relativeTime].push(file)
  })

  return groups
}

export function RecentView({ files, onFileSelect, onFilePreview, onFileShare }: RecentViewProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)

  const groupedFiles = groupFilesByAccessDate(files)
  const timeGroups = Object.keys(groupedFiles)

  return (
    <div className="p-4 md:p-8 bg-gray-50/30 min-h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Archivos Recientes</h3>
          </div>
          <p className="text-gray-600">Archivos y carpetas a los que has accedido recientemente</p>
        </div>

        {timeGroups.length > 0 ? (
          <div className="space-y-8">
            {timeGroups.map((timeGroup) => (
              <div key={timeGroup}>
                <div className="flex items-center space-x-4 mb-4">
                  <h4 className="text-md font-semibold text-gray-700">{timeGroup}</h4>
                  <Separator className="flex-1" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {groupedFiles[timeGroup].map((file) => {
                    const fileIcon = getFileIcon(file.type)
                    const colorClass = getFileColor(file.type)

                    return (
                      <Card
                        key={file.id}
                        className={cn(
                          "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1",
                          "border-0 shadow-sm bg-white/70 backdrop-blur-sm",
                        )}
                        onMouseEnter={() => setHoveredFile(file.id)}
                        onMouseLeave={() => setHoveredFile(null)}
                        onClick={() => onFileSelect(file)}
                      >
                        <CardContent className="p-5">
                          <div className="relative">
                            {file.thumbnail && file.type !== "folder" ? (
                              <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-inner">
                                <img
                                  src={file.thumbnail || "/placeholder.svg"}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="aspect-square flex items-center justify-center mb-4 relative">
                                <div
                                  className={cn(
                                    "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                                    colorClass,
                                  )}
                                >
                                  <span className="text-2xl">{fileIcon}</span>
                                </div>
                              </div>
                            )}

                            {file.starred && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                                <Star className="h-3 w-3 text-white fill-current" />
                              </div>
                            )}

                            {hoveredFile === file.id && (
                              <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center space-x-2 transition-all duration-200 backdrop-blur-sm">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="bg-white/90 hover:bg-white shadow-lg"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onFilePreview(file)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="bg-white/90 hover:bg-white shadow-lg"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onFileShare(file)
                                  }}
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">{file.name}</h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => onFilePreview(file)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Vista previa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => onFileShare(file)}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Compartir
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Star className="mr-2 h-4 w-4" />
                                    {file.starred ? "Quitar de favoritos" : "Añadir a favoritos"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500 font-medium">{file.size || "Carpeta"}</p>
                              <p className="text-xs text-gray-400">{file.modified}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay actividad reciente</h3>
            <p className="text-gray-500 mb-6">Los archivos a los que accedas aparecerán aquí</p>
            <Button variant="outline">Explorar archivos</Button>
          </div>
        )}
      </div>
    </div>
  )
}
