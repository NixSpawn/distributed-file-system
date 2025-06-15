"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Home, FolderPlus, Upload } from "lucide-react"
import { FileItem } from "@/types/types"
import { FileGrid } from "./file-grid"

interface FolderViewProps {
  folder: FileItem
  onClose: () => void
  onFileSelect: (file: FileItem) => void
  onFilePreview: (file: FileItem) => void
  onFileShare: (file: FileItem) => void
}

// Datos simulados para el contenido de las carpetas
const getFolderContents = (folderId: string): FileItem[] => {
  const baseContents: Record<string, FileItem[]> = {
    "1": [
      // Proyectos Creativos
      {
        id: "1-1",
        name: "Diseños Web",
        type: "folder",
        modified: "2024-01-14",
        owner: "Tú",
        color: "#42A5F5",
      },
      {
        id: "1-2",
        name: "Logos y Branding",
        type: "folder",
        modified: "2024-01-13",
        owner: "Tú",
        color: "#66BB6A",
      },
      {
        id: "1-3",
        name: "Mockup_Homepage.psd",
        type: "image",
        size: "15.2 MB",
        modified: "2024-01-12",
        owner: "Tú",
        thumbnail: "/placeholder.svg?height=120&width=120",
        starred: true,
      },
      {
        id: "1-4",
        name: "Propuesta_Cliente.pdf",
        type: "document",
        size: "2.8 MB",
        modified: "2024-01-11",
        owner: "Tú",
        thumbnail: "/placeholder.svg?height=120&width=120",
      },
      {
        id: "1-5",
        name: "Demo_Animacion.mp4",
        type: "video",
        size: "28.5 MB",
        modified: "2024-01-10",
        owner: "Tú",
        thumbnail: "/placeholder.svg?height=120&width=120",
      },
    ],
    "5": [
      // Música Favorita
      {
        id: "5-1",
        name: "Rock Clásico",
        type: "folder",
        modified: "2024-01-10",
        owner: "Tú",
        color: "#FF7043",
      },
      {
        id: "5-2",
        name: "Jazz",
        type: "folder",
        modified: "2024-01-09",
        owner: "Tú",
        color: "#AB47BC",
      },
      {
        id: "5-3",
        name: "Bohemian_Rhapsody.mp3",
        type: "audio",
        size: "5.8 MB",
        modified: "2024-01-08",
        owner: "Tú",
        starred: true,
      },
      {
        id: "5-4",
        name: "Hotel_California.mp3",
        type: "audio",
        size: "6.2 MB",
        modified: "2024-01-07",
        owner: "Tú",
      },
      {
        id: "5-5",
        name: "Playlist_Favoritos.m3u",
        type: "document",
        size: "2.1 KB",
        modified: "2024-01-06",
        owner: "Tú",
      },
    ],
  }

  return (
    baseContents[folderId] || [
      {
        id: `${folderId}-empty`,
        name: "Carpeta vacía",
        type: "folder",
        modified: "2024-01-15",
        owner: "Tú",
        color: "#9E9E9E",
      },
    ]
  )
}

export function FolderView({ folder, onClose, onFileSelect, onFilePreview, onFileShare }: FolderViewProps) {
  const [currentPath, setCurrentPath] = useState([folder])
  const currentFolder = currentPath[currentPath.length - 1]
  const folderContents = getFolderContents(currentFolder.id)

  const handleFileSelect = (file: FileItem) => {
    if (file.type === "folder") {
      // Navegar a la subcarpeta
      setCurrentPath([...currentPath, file])
    } else {
      // Abrir el archivo
      onFileSelect(file)
    }
  }

  const navigateBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1))
    } else {
      onClose()
    }
  }

  const navigateToRoot = () => {
    onClose()
  }

  const navigateToFolder = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1))
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-3 md:p-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={navigateBack} className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{currentFolder.name}</h1>
          </div>
          <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-9 md:h-10">
              <Upload className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Subir</span>
            </Button>
            <Button variant="outline" className="h-9 md:h-10">
              <FolderPlus className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Nueva Carpeta</span>
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-1 md:space-x-2 text-sm overflow-x-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToRoot}
            className="text-blue-600 hover:text-blue-700 p-1 h-auto shrink-0"
          >
            <Home className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="hidden sm:inline">Inicio</span>
          </Button>
          {currentPath.map((pathFolder, index) => (
            <div key={pathFolder.id} className="flex items-center space-x-1 md:space-x-2 shrink-0">
              <span className="text-gray-400">/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToFolder(index)}
                className={`p-1 h-auto truncate max-w-[120px] md:max-w-none ${
                  index === currentPath.length - 1
                    ? "text-gray-900 font-medium cursor-default"
                    : "text-blue-600 hover:text-blue-700"
                }`}
                disabled={index === currentPath.length - 1}
                title={pathFolder.name}
              >
                {pathFolder.name}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {folderContents.length > 0 ? (
          <FileGrid
            files={folderContents}
            onFileSelect={handleFileSelect}
            onFilePreview={onFilePreview}
            onFileShare={onFileShare}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Carpeta vacía</h3>
              <p className="text-gray-500 mb-6">Esta carpeta no contiene archivos o subcarpetas</p>
              <div className="flex space-x-3">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir archivos
                </Button>
                <Button variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Nueva carpeta
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
