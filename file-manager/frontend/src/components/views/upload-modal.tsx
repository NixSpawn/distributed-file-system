"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UploadFile {
  id: string
  name: string
  size: string
  progress: number
  status: "uploading" | "completed" | "error"
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    simulateUpload(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    simulateUpload(files)
  }, [])

  const simulateUpload = (files: File[]) => {
    const newUploadFiles: UploadFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: "uploading" as const,
    }))

    setUploadFiles((prev) => [...prev, ...newUploadFiles])

    // Simular progreso de subida
    newUploadFiles.forEach((uploadFile) => {
      const interval = setInterval(() => {
        setUploadFiles((prev) =>
          prev.map((f) => {
            if (f.id === uploadFile.id) {
              const newProgress = Math.min(f.progress + Math.random() * 20, 100)
              return {
                ...f,
                progress: newProgress,
                status: newProgress === 100 ? "completed" : "uploading",
              }
            }
            return f
          }),
        )
      }, 200)

      setTimeout(() => clearInterval(interval), 3000)
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir archivos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Arrastra archivos aquí</p>
            <p className="text-gray-500 mb-4">o haz clic para seleccionar archivos</p>
            <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-upload" />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Seleccionar archivos
              </label>
            </Button>
          </div>

          {uploadFiles.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <File className="h-5 w-5 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress value={file.progress} className="flex-1 h-2" />
                      <span className="text-xs text-gray-500">{file.progress.toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === "completed" && <Check className="h-5 w-5 text-green-500" />}
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="h-6 w-6 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
