"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Folder,
  FileText,
  ImageIcon,
  Video,
  Music,
  File,
  MoreVertical,
  Download,
  Share2,
  Star,
  Trash2,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FileItem } from "@/types/types"

interface FileListProps {
  files: FileItem[]
  onFileSelect: (file: FileItem) => void
  onFilePreview: (file: FileItem) => void
  onFileShare: (file: FileItem) => void
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "folder":
      return Folder
    case "image":
      return ImageIcon
    case "document":
      return FileText
    case "video":
      return Video
    case "audio":
      return Music
    default:
      return File
  }
}

const getFileColor = (type: string) => {
  switch (type) {
    case "folder":
      return "text-blue-600"
    case "image":
      return "text-green-600"
    case "document":
      return "text-red-600"
    case "video":
      return "text-purple-600"
    case "audio":
      return "text-orange-600"
    default:
      return "text-gray-600"
  }
}

export function FileList({ files, onFileSelect, onFilePreview, onFileShare }: FileListProps) {
  return (
    <div className="p-6 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Nombre</TableHead>
            <TableHead>Propietario</TableHead>
            <TableHead>Última modificación</TableHead>
            <TableHead>Tamaño</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const Icon = getFileIcon(file.type)
            const colorClass = getFileColor(file.type)

            return (
              <TableRow
                key={file.id}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onFileSelect(file)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Icon className={cn("h-5 w-5", colorClass)} />
                    <span className="truncate">{file.name}</span>
                    {file.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    {file.shared && <Share2 className="h-4 w-4 text-blue-500" />}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{file.owner}</TableCell>
                <TableCell className="text-gray-600">{file.modified}</TableCell>
                <TableCell className="text-gray-600">{file.size || "—"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
