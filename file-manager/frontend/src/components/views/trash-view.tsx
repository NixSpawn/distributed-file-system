"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, RotateCcw, X } from "lucide-react"

const trashedFiles = [
  {
    id: "1",
    name: "Documento_Viejo.pdf",
    type: "document",
    size: "1.2 MB",
    deletedDate: "2024-01-10",
    originalLocation: "/Documentos",
  },
  {
    id: "2",
    name: "Foto_Borrada.jpg",
    type: "image",
    size: "2.1 MB",
    deletedDate: "2024-01-08",
    originalLocation: "/Imágenes/Vacaciones",
  },
  {
    id: "3",
    name: "Carpeta_Temporal",
    type: "folder",
    deletedDate: "2024-01-05",
    originalLocation: "/Proyectos",
  },
]

export function TrashView() {
  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Papelera</h2>
              <p className="text-gray-600">Los elementos se eliminan permanentemente después de 30 días</p>
            </div>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              Vaciar papelera
            </Button>
          </div>
        </div>

        {trashedFiles.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Ubicación original</TableHead>
                    <TableHead>Fecha de eliminación</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead className="w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trashedFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell className="text-gray-600">{file.originalLocation}</TableCell>
                      <TableCell className="text-gray-600">{file.deletedDate}</TableCell>
                      <TableCell className="text-gray-600">{file.size || "—"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Trash2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">La papelera está vacía</h3>
              <p className="text-gray-500">Los archivos eliminados aparecerán aquí</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
