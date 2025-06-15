"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileItem } from "@/types/types"
import { Download, Share2, X, FileText, ZoomIn, ZoomOut } from "lucide-react"
import { useState } from "react"

interface DocumentViewerProps {
  file: FileItem
  onClose: () => void
}

export function DocumentViewer({ file, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <Card className="w-full max-w-xs sm:max-w-2xl md:max-w-4xl h-[95vh] md:h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 md:pb-4 border-b px-3 md:px-6 pt-3 md:pt-6">
          <CardTitle className="text-sm md:text-lg font-semibold truncate flex items-center pr-2">
            <FileText className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 shrink-0" />
            <span className="truncate">{file.name}</span>
          </CardTitle>
          <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
            <span className="text-xs md:text-sm text-gray-500 hidden sm:inline">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <ZoomOut className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <ZoomIn className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <div className="w-px h-4 md:h-6 bg-gray-300 hidden sm:block" />
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 hidden sm:flex">
              <Download className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 hidden sm:flex">
              <Share2 className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 md:h-10 md:w-10">
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full bg-gray-100 flex items-center justify-center overflow-auto">
            <div
              className="bg-white shadow-lg mx-2 md:mx-4 my-2 md:my-4 p-4 md:p-8 max-w-full"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                minHeight: "600px",
                width: "100%",
                maxWidth: "210mm", // A4 width
              }}
            >
              <div className="space-y-3 md:space-y-4">
                <div className="text-center border-b pb-3 md:pb-4">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">{file.name.replace(/\.[^/.]+$/, "")}</h1>
                  <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Documento simulado</p>
                </div>

                <div className="space-y-3 md:space-y-4 text-gray-800 leading-relaxed text-sm md:text-base">
                  <p>
                    Este es un documento de ejemplo que simula el contenido de {file.name}. En una implementación real,
                    aquí se mostraría el contenido real del documento.
                  </p>

                  <h2 className="text-lg md:text-xl font-semibold mt-4 md:mt-6 mb-2 md:mb-3">
                    Sección 1: Introducción
                  </h2>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </p>

                  <h2 className="text-lg md:text-xl font-semibold mt-4 md:mt-6 mb-2 md:mb-3">Sección 2: Desarrollo</h2>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur.
                  </p>

                  <ul className="list-disc list-inside space-y-1 md:space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                    <li>Punto importante número uno</li>
                    <li>Punto importante número dos</li>
                    <li>Punto importante número tres</li>
                  </ul>
                </div>

                <div className="text-center text-gray-500 text-xs md:text-sm mt-6 md:mt-8 pt-3 md:pt-4 border-t">
                  <p>
                    <span className="hidden sm:inline">
                      Propietario: {file.owner} • Modificado: {file.modified} •{" "}
                    </span>
                    Tamaño: {file.size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
