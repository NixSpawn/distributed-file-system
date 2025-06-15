"use client"

import { LandingPage } from "@/components/pages/landing-page"
import { LoginPage } from "@/components/pages/login-page"
import { AudioPlayer } from "@/components/views/audio-player"
import { CreateFolderModal } from "@/components/views/create-folder-modal"
import { DocumentViewer } from "@/components/views/document-viewer"
import { FavoritesView } from "@/components/views/favorites-view"
import { FileDetails } from "@/components/views/file-details"
import { FileGrid } from "@/components/views/file-grid"
import { FileList } from "@/components/views/file-list"
import { FilesView } from "@/components/views/files-view"
import { FolderView } from "@/components/views/folder-view"
import { ImageViewer } from "@/components/views/image-viewer"
import { PreviewModal } from "@/components/views/preview-modal"
import { RecentView } from "@/components/views/recent-view"
import { SearchView } from "@/components/views/search-view"
import { ShareModal } from "@/components/views/share-modal"
import { SharedView } from "@/components/views/shared-view"
import { Sidebar } from "@/components/views/sidebar"
import { TopBar } from "@/components/views/top-bar"
import { TrashView } from "@/components/views/trash-view"
import { UploadModal } from "@/components/views/upload-modal"
import { VideoPlayer } from "@/components/views/video-player"
import { FileItem, ViewType } from "@/types/types"
import { useState } from "react"

type AppState = "landing" | "login" | "dashboard"

const mockFiles: FileItem[] = [
  {
    id: "1",
    name: "Proyectos Creativos",
    type: "folder",
    modified: "2024-01-15",
    owner: "Tú",
    starred: true,
    color: "#FFA726",
    lastAccessed: "2024-01-20",
  },
  {
    id: "2",
    name: "Presentación Q4.pptx",
    type: "document",
    size: "2.4 MB",
    modified: "2024-01-14",
    owner: "María García",
    shared: true,
    thumbnail: "/placeholder.svg?height=120&width=120",
    color: "#42A5F5",
    lastAccessed: "2024-01-19",
  },
  {
    id: "3",
    name: "Foto_Vacaciones.jpg",
    type: "image",
    size: "1.8 MB",
    modified: "2024-01-13",
    owner: "Tú",
    thumbnail: "/placeholder.svg?height=120&width=120",
    color: "#66BB6A",
    starred: true,
    lastAccessed: "2024-01-18",
  },
  {
    id: "4",
    name: "Video_Proyecto.mp4",
    type: "video",
    size: "45.2 MB",
    modified: "2024-01-12",
    owner: "Juan Pérez",
    shared: true,
    thumbnail: "/placeholder.svg?height=120&width=120",
    color: "#AB47BC",
    lastAccessed: "2024-01-17",
  },
  {
    id: "5",
    name: "Música Favorita",
    type: "folder",
    modified: "2024-01-11",
    owner: "Tú",
    color: "#FF7043",
    starred: true,
    lastAccessed: "2024-01-16",
  },
  {
    id: "6",
    name: "Informe_Anual.pdf",
    type: "document",
    size: "3.1 MB",
    modified: "2024-01-10",
    owner: "Ana López",
    starred: true,
    thumbnail: "/placeholder.svg?height=120&width=120",
    color: "#42A5F5",
    lastAccessed: "2024-01-15",
  },
  {
    id: "7",
    name: "Canción_Demo.mp3",
    type: "audio",
    size: "4.2 MB",
    modified: "2024-01-09",
    owner: "Tú",
    color: "#FF7043",
    lastAccessed: "2024-01-14",
  },
]

export default function CloudDrive() {
  const [appState, setAppState] = useState<AppState>("landing")
  const [currentView, setCurrentView] = useState<ViewType>("grid")
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [files, setFiles] = useState<FileItem[]>(mockFiles)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)
  const [showFolderView, setShowFolderView] = useState(false)

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleFileOpen = (file: FileItem) => {
    setSelectedFile(file)

    switch (file.type) {
      case "folder":
        setShowFolderView(true)
        break
      case "audio":
        setShowAudioPlayer(true)
        break
      case "video":
        setShowVideoPlayer(true)
        break
      case "image":
        setShowImageViewer(true)
        break
      case "document":
        setShowDocumentViewer(true)
        break
      default:
        setShowPreviewModal(true)
    }
  }

  const renderMainContent = () => {
    switch (currentView) {
      case "grid":
        return (
          <FileGrid
            files={filteredFiles}
            onFileSelect={handleFileOpen}
            onFilePreview={(file) => {
              setSelectedFile(file)
              setShowPreviewModal(true)
            }}
            onFileShare={(file) => {
              setSelectedFile(file)
              setShowShareModal(true)
            }}
          />
        )
      case "list":
        return (
          <FileList
            files={filteredFiles}
            onFileSelect={handleFileOpen}
            onFilePreview={(file) => {
              setSelectedFile(file)
              setShowPreviewModal(true)
            }}
            onFileShare={(file) => {
              setSelectedFile(file)
              setShowShareModal(true)
            }}
          />
        )
      case "details":
        return selectedFile ? (
          <FileDetails file={selectedFile} onClose={() => setSelectedFile(null)} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Selecciona un archivo para ver los detalles
          </div>
        )
      case "search":
        return <SearchView files={files} />
      case "trash":
        return <TrashView />
      case "shared":
        return <SharedView files={files.filter((f) => f.shared)} />
      case "files":
        return (
          <FilesView
            files={filteredFiles}
            onFileSelect={handleFileOpen}
            onFilePreview={(file) => {
              setSelectedFile(file)
              setShowPreviewModal(true)
            }}
            onFileShare={(file) => {
              setSelectedFile(file)
              setShowShareModal(true)
            }}
          />
        )
      case "favorites":
        return (
          <FavoritesView
            files={files.filter((f) => f.starred)}
            onFileSelect={handleFileOpen}
            onFilePreview={(file) => {
              setSelectedFile(file)
              setShowPreviewModal(true)
            }}
            onFileShare={(file) => {
              setSelectedFile(file)
              setShowShareModal(true)
            }}
          />
        )
      case "recent":
        return (
          <RecentView
            files={files
              .sort(
                (a, b) =>
                  new Date(b.lastAccessed || b.modified).getTime() - new Date(a.lastAccessed || a.modified).getTime(),
              )
              .slice(0, 10)}
            onFileSelect={handleFileOpen}
            onFilePreview={(file) => {
              setSelectedFile(file)
              setShowPreviewModal(true)
            }}
            onFileShare={(file) => {
              setSelectedFile(file)
              setShowShareModal(true)
            }}
          />
        )
      default:
        return null
    }
  }

  if (appState === "landing") {
    return <LandingPage onGetStarted={() => setAppState("login")} onLogin={() => setAppState("login")} />
  }

  if (appState === "login") {
    return (
      <LoginPage
        onLogin={() => setAppState("dashboard")}
        onBack={() => setAppState("landing")}
        onSignUp={() => setAppState("login")}
      />
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onUpload={() => setShowUploadModal(true)}
        onCreateFolder={() => setShowCreateFolderModal(true)}
        mobileOpen={mobileMenuOpen}
        onMobileOpenChange={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          currentView={currentView}
          onViewChange={setCurrentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">{renderMainContent()}</main>
      </div>

      <UploadModal open={showUploadModal} onOpenChange={setShowUploadModal} />

      <PreviewModal file={selectedFile} open={showPreviewModal} onOpenChange={setShowPreviewModal} />

      <ShareModal file={selectedFile} open={showShareModal} onOpenChange={setShowShareModal} />

      <CreateFolderModal
        open={showCreateFolderModal}
        onOpenChange={setShowCreateFolderModal}
        onCreateFolder={(name) => {
          const newFolder: FileItem = {
            id: Date.now().toString(),
            name,
            type: "folder",
            modified: new Date().toISOString().split("T")[0],
            owner: "Tú",
            color: "#FFA726",
          }
          setFiles((prev) => [newFolder, ...prev])
        }}
      />
      {showAudioPlayer && selectedFile && (
        <AudioPlayer
          file={selectedFile}
          onClose={() => {
            setShowAudioPlayer(false)
            setSelectedFile(null)
          }}
        />
      )}

      {showVideoPlayer && selectedFile && (
        <VideoPlayer
          file={selectedFile}
          onClose={() => {
            setShowVideoPlayer(false)
            setSelectedFile(null)
          }}
        />
      )}

      {showImageViewer && selectedFile && (
        <ImageViewer
          file={selectedFile}
          onClose={() => {
            setShowImageViewer(false)
            setSelectedFile(null)
          }}
        />
      )}

      {showDocumentViewer && selectedFile && (
        <DocumentViewer
          file={selectedFile}
          onClose={() => {
            setShowDocumentViewer(false)
            setSelectedFile(null)
          }}
        />
      )}

      {showFolderView && selectedFile && (
        <FolderView
          folder={selectedFile}
          onClose={() => {
            setShowFolderView(false)
            setSelectedFile(null)
          }}
          onFileSelect={handleFileOpen}
          onFilePreview={(file) => {
            setSelectedFile(file)
            setShowPreviewModal(true)
          }}
          onFileShare={(file) => {
            setSelectedFile(file)
            setShowShareModal(true)
          }}
        />
      )}
    </div>
  )
}
