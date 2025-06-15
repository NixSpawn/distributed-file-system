"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Shield, Zap, Users, Star, ArrowRight, Play } from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Cloud,
      title: "Almacenamiento Ilimitado",
      description: "Guarda todos tus archivos sin límites de espacio",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Seguridad Avanzada",
      description: "Encriptación de extremo a extremo para máxima protección",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Sincronización Rápida",
      description: "Accede a tus archivos al instante desde cualquier dispositivo",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Users,
      title: "Colaboración en Tiempo Real",
      description: "Comparte y colabora con tu equipo sin esfuerzo",
      gradient: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">CloudDrive</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onLogin}>
              Iniciar Sesión
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={onGetStarted}
            >
              Comenzar Gratis
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Star className="w-4 h-4 mr-2" />
            Más de 1M de usuarios confían en nosotros
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Tu nube personal
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              reimaginada
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Almacena, sincroniza y comparte tus archivos de forma segura. Accede a todo desde cualquier lugar con la
            velocidad que necesitas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
              onClick={onGetStarted}
            >
              Comenzar Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg- border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg hover:cursor-pointer"
            >
              <Play className="mr-2 h-5 w-5" />
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Características Poderosas</h2>
            <p className="text-xl text-gray-300">Todo lo que necesitas para gestionar tus archivos</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transform transition-transform duration-300 ${
                      hoveredFeature === index ? "scale-110" : ""
                    }`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">CloudDrive</span>
            </div>
            <div className="flex items-center space-x-6 text-gray-300">
              <a href="#" className="hover:text-white transition-colors">
                Privacidad
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Términos
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Soporte
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2024 CloudDrive. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
