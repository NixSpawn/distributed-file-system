"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCw, Download, Share2, X } from "lucide-react"
import { FileItem } from "@/types/types"

interface ImageViewerProps {
  file: FileItem
  onClose: () => void
}

export function ImageViewer({ file, onClose }: ImageViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleReset = () => {
    setZoom(100)
    setRotation(0)
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      {/* Controls */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-center z-10">
        <div className="flex items-center space-x-1 md:space-x-2">
          <span className="text-white font-medium text-sm md:text-base truncate max-w-[150px] md:max-w-none">
            {file.name}
          </span>
          <span className="text-gray-300 text-xs md:text-sm">({zoom}%)</span>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10"
            disabled={zoom <= 25}
          >
            <ZoomOut className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10"
            disabled={zoom >= 300}
          >
            <ZoomIn className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotate}
            className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10"
          >
            <RotateCw className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-white hover:bg-white/20 text-xs md:text-sm px-2 md:px-3 h-8 md:h-10 hidden sm:flex"
          >
            Restablecer
          </Button>

          <div className="w-px h-4 md:h-6 bg-gray-600 mx-1 md:mx-2" />

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10 hidden sm:flex"
          >
            <Download className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10 hidden sm:flex"
          >
            <Share2 className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>

      {/* Image */}
      <div className="flex items-center justify-center w-full h-full p-8 md:p-16">
        <div
          className="relative max-w-full max-h-full overflow-hidden"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transition: "transform 0.3s ease",
          }}
        >
          <img
            src={file.thumbnail || "/placeholder.svg?height=600&width=800"}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: "60vh", maxWidth: "90vw" }}
          />
        </div>
      </div>

      {/* Info Bar */}
      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 flex justify-center">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 md:px-4 py-1 md:py-2 text-white text-xs md:text-sm">
          <span className="hidden sm:inline">
            {file.size} • {file.modified} • {file.owner}
          </span>
          <span className="sm:hidden">{file.size}</span>
        </div>
      </div>
    </div>
  )
}
