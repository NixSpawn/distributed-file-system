"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Share2, Users, Eye, Download } from "lucide-react"
import { FileItem } from "@/types/types"

interface SharedViewProps {
  files: FileItem[]
}

export function SharedView({ files }: SharedViewProps) {
  const sharedWithMe = files.filter((f) => f.shared && f.owner !== "Tú")
  const sharedByMe = files.filter((f) => f.shared && f.owner === "Tú")

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Archivos compartidos</h2>
          <p className="text-gray-600">Gestiona los archivos que has compartido y los que han compartido contigo</p>
        </div>

        {/* Compartidos conmigo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Compartidos conmigo ({sharedWithMe.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sharedWithMe.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Propietario</TableHead>
                    <TableHead>Última modificación</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedWithMe.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell>{file.owner}</TableCell>
                      <TableCell>{file.modified}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Lectura</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tienes archivos compartidos contigo</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compartidos por mí */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="mr-2 h-5 w-5" />
              Compartidos por mí ({sharedByMe.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sharedByMe.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Compartido con</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Fecha de compartición</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedByMe.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell>3 personas</TableCell>
                      <TableCell>
                        <Badge variant="outline">Lectura/Escritura</Badge>
                      </TableCell>
                      <TableCell>{file.modified}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Gestionar acceso
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No has compartido ningún archivo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
