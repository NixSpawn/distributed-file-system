"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, Maximize, X, Download, Share2 } from "lucide-react"
import { FileItem } from "@/types/types"

interface VideoPlayerProps {
  file: FileItem
  onClose: () => void
}

export function VideoPlayer({ file, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, ] = useState(300) // 5 minutos simulados
  const [volume, setVolume] = useState([75])
  const [showControls, setShowControls] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
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
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-6xl max-h-full bg-black" onMouseMove={handleMouseMove}>
        {/* Video Area */}
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center text-white">
            <div className="text-8xl mb-4">🎬</div>
            <h3 className="text-2xl font-semibold mb-2">{file.name}</h3>
            <p className="text-gray-300">Simulación de reproductor de video</p>
          </div>

          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
            {!isPlaying && (
              <div className="bg-black/50 rounded-full p-6">
                <Play className="h-16 w-16 text-white ml-2" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 md:p-6 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-3 md:mb-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={(value) => setCurrentTime(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 shrink-0"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <Play className="h-5 w-5 md:h-6 md:w-6 ml-1" />
                )}
              </Button>

              <div className="hidden sm:flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-white" />
                <Slider value={volume} max={100} step={1} onValueChange={setVolume} className="w-16 md:w-20" />
              </div>

              <span className="text-white text-xs md:text-sm font-medium truncate hidden md:block">{file.name}</span>
            </div>

            <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10">
                <Download className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10">
                <Share2 className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10 hidden sm:flex"
              >
                <Maximize className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
