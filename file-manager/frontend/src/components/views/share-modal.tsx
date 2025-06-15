"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Copy, Mail, Link, Users, X } from "lucide-react"
import { FileItem } from "@/types/types"

interface ShareModalProps {
  file: FileItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SharedUser {
  id: string
  name: string
  email: string
  permission: "view" | "edit" | "owner"
  avatar?: string
}

const mockSharedUsers: SharedUser[] = [
  {
    id: "1",
    name: "María García",
    email: "maria@ejemplo.com",
    permission: "edit",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: "2",
    name: "Juan Pérez",
    email: "juan@ejemplo.com",
    permission: "view",
  },
]

export function ShareModal({ file, open, onOpenChange }: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<"view" | "edit">("view")
  const [linkSharing, setLinkSharing] = useState(false)
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(mockSharedUsers)

  if (!file) return null

  const handleAddUser = () => {
    if (email) {
      const newUser: SharedUser = {
        id: Date.now().toString(),
        name: email.split("@")[0],
        email,
        permission,
      }
      setSharedUsers([...sharedUsers, newUser])
      setEmail("")
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSharedUsers(sharedUsers.filter((user) => user.id !== userId))
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`https://drive.ejemplo.com/file/${file.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Compartir {file.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Compartir con personas */}
          <div className="space-y-4">
            <Label>Compartir con personas</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Introduce email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={permission} onValueChange={(value: "view" | "edit") => setPermission(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Ver</SelectItem>
                  <SelectItem value="edit">Editar</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddUser} disabled={!email}>
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de usuarios compartidos */}
          {sharedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Personas con acceso</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.permission === "owner" ? "default" : "secondary"}>
                        {user.permission === "owner"
                          ? "Propietario"
                          : user.permission === "edit"
                            ? "Editor"
                            : "Visualizador"}
                      </Badge>
                      {user.permission !== "owner" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compartir con enlace */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Compartir con enlace</Label>
              <Switch checked={linkSharing} onCheckedChange={setLinkSharing} />
            </div>

            {linkSharing && (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input value={`https://drive.ejemplo.com/file/${file.id}`} readOnly className="flex-1" />
                  <Button variant="outline" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Cualquier persona con este enlace puede ver el archivo</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button>
              <Link className="mr-2 h-4 w-4" />
              Compartir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
