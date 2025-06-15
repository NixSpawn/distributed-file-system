"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Calendar, User, FileType } from "lucide-react"
import { FileItem } from "@/types/types"

interface SearchViewProps {
  files: FileItem[]
}

export function SearchView({ files }: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || file.type === typeFilter
    const matchesOwner = ownerFilter === "all" || file.owner === ownerFilter

    return matchesSearch && matchesType && matchesOwner
  })

  const uniqueOwners = Array.from(new Set(files.map((f) => f.owner)))

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Búsqueda avanzada</h2>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filtros de búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar archivos y carpetas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    <FileType className="inline mr-1 h-4 w-4" />
                    Tipo de archivo
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="folder">Carpetas</SelectItem>
                      <SelectItem value="document">Documentos</SelectItem>
                      <SelectItem value="image">Imágenes</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    <User className="inline mr-1 h-4 w-4" />
                    Propietario
                  </label>
                  <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los propietarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los propietarios</SelectItem>
                      {uniqueOwners.map((owner) => (
                        <SelectItem key={owner} value={owner}>
                          {owner}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    <Calendar className="inline mr-1 h-4 w-4" />
                    Fecha
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="week">Esta semana</SelectItem>
                      <SelectItem value="month">Este mes</SelectItem>
                      <SelectItem value="year">Este año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredFiles.length} resultado{filteredFiles.length !== 1 ? "s" : ""}
            </span>
            {(searchQuery || typeFilter !== "all" || ownerFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setTypeFilter("all")
                  setOwnerFilter("all")
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {file.thumbnail ? (
                        <img
                          src={file.thumbnail || "/placeholder.svg"}
                          alt={file.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <FileType className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{file.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {file.type}
                        </Badge>
                        <span className="text-xs text-gray-500">{file.owner}</span>
                        <span className="text-xs text-gray-500">{file.modified}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{file.size || "Carpeta"}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda o usar términos diferentes.</p>
          </div>
        )}
      </div>
    </div>
  )
}
