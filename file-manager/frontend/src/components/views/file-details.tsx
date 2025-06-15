"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Download, Share2, Star, Trash2, Calendar, User, HardDrive, Eye } from "lucide-react"
import { FileItem } from "@/types/types"

interface FileDetailsProps {
  file: FileItem
  onClose: () => void
}

export function FileDetails({ file, onClose }: FileDetailsProps) {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Detalles del archivo</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Vista previa */}
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                {file.thumbnail ? (
                  <img
                    src={file.thumbnail || "/placeholder.svg"}
                    alt={file.name}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Vista previa no disponible</p>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{file.type}</Badge>
                {file.starred && <Badge variant="outline">Favorito</Badge>}
                {file.shared && <Badge variant="outline">Compartido</Badge>}
              </div>
            </CardContent>
          </Card>

          {/* Información del archivo */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <HardDrive className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Tamaño</p>
                  <p className="text-sm text-gray-600">{file.size || "Carpeta"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Propietario</p>
                  <p className="text-sm text-gray-600">{file.owner}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Última modificación</p>
                  <p className="text-sm text-gray-600">{file.modified}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
                <Button variant="outline" className="justify-start">
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
                <Button variant="outline" className="justify-start">
                  <Star className="mr-2 h-4 w-4" />
                  {file.starred ? "Quitar favorito" : "Añadir favorito"}
                </Button>
                <Button variant="outline" className="justify-start text-red-600 hover:text-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Historial de versiones */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de versiones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Versión actual</p>
                    <p className="text-xs text-gray-500">Modificado el {file.modified}</p>
                  </div>
                  <Badge>Actual</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Versión anterior</p>
                    <p className="text-xs text-gray-500">Modificado el 2024-01-10</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Restaurar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
