"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Download, Share2, Star, Trash2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { FileItem } from "@/types/types"

interface FileGridProps {
  files: FileItem[]
  onFileSelect: (file: FileItem) => void
  onFilePreview: (file: FileItem) => void
  onFileShare: (file: FileItem) => void
}

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

export function FileGrid({ files, onFileSelect, onFilePreview, onFileShare }: FileGridProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)
  const isMobile = useIsMobile()

  return (
    <div className="p-4 md:p-8 bg-gray-50/30 min-h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Archivos y Carpetas</h3>
          <p className="text-sm md:text-base text-gray-600">Organiza y gestiona tu contenido</p>
        </div>

        <div
          className={cn(
            "grid gap-3 md:gap-6",
            "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
          )}
        >
          {files.map((file) => {
            const fileIcon = getFileIcon(file.type)
            const colorClass = getFileColor(file.type)

            return (
              <Card
                key={file.id}
                className={cn(
                  "group cursor-pointer transition-all duration-300",
                  "border-0 shadow-sm bg-white/70 backdrop-blur-sm",
                  !isMobile && "hover:shadow-xl hover:scale-105 hover:-translate-y-1",
                )}
                onMouseEnter={() => !isMobile && setHoveredFile(file.id)}
                onMouseLeave={() => !isMobile && setHoveredFile(null)}
                onClick={() => onFileSelect(file)}
              >
                <CardContent className="p-3 md:p-5">
                  <div className="relative">
                    {file.thumbnail && file.type !== "folder" ? (
                      <div className="aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-4 bg-gray-100 shadow-inner">
                        <img
                          src={file.thumbnail || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square flex items-center justify-center mb-3 md:mb-4 relative">
                        <div
                          className={cn(
                            "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                            colorClass,
                          )}
                        >
                          <span className="text-lg md:text-2xl">{fileIcon}</span>
                        </div>
                      </div>
                    )}

                    {file.starred && (
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 w-5 h-5 md:w-6 md:h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                        <Star className="h-2 w-2 md:h-3 md:w-3 text-white fill-current" />
                      </div>
                    )}

                    {!isMobile && hoveredFile === file.id && (
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

                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs md:text-sm font-semibold text-gray-900 truncate flex-1">{file.name}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-5 w-5 md:h-6 md:w-6 p-0 transition-opacity hover:bg-gray-100",
                              isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3 md:h-4 md:w-4" />
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
                      <p className="text-xs font-medium text-gray-500">{file.size || "Carpeta"}</p>
                      <p className="text-xs text-gray-400">{file.modified}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
