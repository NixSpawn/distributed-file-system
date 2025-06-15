"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Share2, Star } from "lucide-react"
import { FileItem } from "@/types/types"

interface PreviewModalProps {
  file: FileItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreviewModal({ file, open, onOpenChange }: PreviewModalProps) {
  if (!file) return null

  const renderPreview = () => {
    switch (file.type) {
      case "image":
        return (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={file.thumbnail || "/placeholder.svg?height=400&width=600"}
              alt={file.name}
              className="w-full h-full object-contain"
            />
          </div>
        )
      case "document":
        return (
          <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-20 bg-red-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xs">PDF</span>
              </div>
              <p className="text-gray-600">Vista previa de documento</p>
            </div>
          </div>
        )
      case "video":
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video controls className="w-full h-full" poster={file.thumbnail}>
              <source src="/placeholder-video.mp4" type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        )
      default:
        return (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-400 rounded-lg mx-auto mb-4"></div>
              <p className="text-gray-600">Vista previa no disponible</p>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate">{file.name}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {renderPreview()}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="space-x-4 flex">
              <span>Propietario: {file.owner}</span>
              <span>Tamaño: {file.size || "Carpeta"}</span>
              <span>Modificado: {file.modified}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
