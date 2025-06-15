"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderPlus } from "lucide-react"

interface CreateFolderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateFolder: (name: string) => void
}

export function CreateFolderModal({ open, onOpenChange, onCreateFolder }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("")

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim())
      setFolderName("")
      onOpenChange(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-semibold">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mr-3">
              <FolderPlus className="h-5 w-5 text-white" />
            </div>
            Nueva Carpeta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name" className="text-sm font-medium text-gray-700">
              Nombre de la carpeta
            </Label>
            <Input
              id="folder-name"
              placeholder="Ingresa el nombre de la carpeta"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 text-base"
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!folderName.trim()}
              className="px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Crear Carpeta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
