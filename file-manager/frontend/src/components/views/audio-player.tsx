"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Download, Share2 } from "lucide-react"
import { FileItem } from "@/types/types"

interface AudioPlayerProps {
  file: FileItem
  onClose: () => void
}

export function AudioPlayer({ file, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, ] = useState(180) // 3 minutos simulados
  const [volume, setVolume] = useState([75])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, duration])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <Card className="w-full max-w-sm md:max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
          <CardTitle className="text-base md:text-lg font-semibold truncate pr-2">{file.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 h-8 w-8 md:h-10 md:w-10">
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6 pb-4 md:pb-6">
          {/* Album Art Simulation */}
          <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
            <div className="text-white text-4xl md:text-6xl">🎵</div>
          </div>

          {/* Track Info */}
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
              {file.name.replace(".mp3", "")}
            </h3>
            <p className="text-xs md:text-sm text-gray-500">Artista Desconocido</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={(value) => setCurrentTime(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3 md:space-x-4">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button
              size="icon"
              onClick={togglePlay}
              className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 md:h-6 md:w-6" />
              ) : (
                <Play className="h-5 w-5 md:h-6 md:w-6 ml-0.5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12">
              <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <Volume2 className="h-3 w-3 md:h-4 md:w-4 text-gray-500 shrink-0" />
            <Slider value={volume} max={100} step={1} onValueChange={setVolume} className="flex-1" />
            <span className="text-xs text-gray-500 w-8 text-right">{volume[0]}%</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1 text-xs md:text-sm h-9 md:h-10">
              <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Descargar</span>
            </Button>
            <Button variant="outline" className="flex-1 text-xs md:text-sm h-9 md:h-10">
              <Share2 className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Compartir</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
