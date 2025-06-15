// Definir los tipos en un archivo separado para mejor organización
export type ViewType = "grid" | "list" | "details" | "search" | "trash" | "shared" | "files" | "favorites" | "recent"

export type FileItem = {
  id: string
  name: string
  type: "folder" | "image" | "document" | "video" | "audio" | "other"
  size?: string
  modified: string
  owner: string
  shared?: boolean
  starred?: boolean
  thumbnail?: string
  color?: string
  lastAccessed?: string
}
