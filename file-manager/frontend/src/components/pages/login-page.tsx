"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Cloud,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Github,
  Chrome,
  Apple,
  Shield,
  Zap,
  Users,
} from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
  onBack: () => void;
  onSignUp: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular login/registro exitoso
    onLogin();
  };

  const features = [
    {
      icon: Shield,
      title: "Seguridad Avanzada",
      description: "Encriptación de extremo a extremo",
    },
    {
      icon: Zap,
      title: "Acceso Instantáneo",
      description: "Sincronización en tiempo real",
    },
    {
      icon: Users,
      title: "Colaboración",
      description: "Comparte con tu equipo fácilmente",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 p-2"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </Button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Cloud className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">CloudDrive</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Bienvenido de vuelta a tu
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}
                  nube personal
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Accede a todos tus archivos desde cualquier lugar del mundo con
                la máxima seguridad y velocidad.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-white font-semibold">+1M usuarios</span>
            </div>
            <p className="text-gray-300 text-sm">
              CloudDrive ha transformado completamente la forma en que gestiono
              mis archivos. Es increíblemente rápido y seguro.
            </p>
            <div className="mt-3 text-gray-400 text-xs">
              - María González, Diseñadora UX
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="space-y-1 pb-6">
              <div className="lg:hidden flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={onBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Cloud className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">
                    CloudDrive
                  </span>
                </div>
              </div>

              <CardTitle className="text-2xl font-bold text-white text-center">
                {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
              </CardTitle>
              <p className="text-gray-300 text-center">
                {isLogin
                  ? "Accede a tu cuenta para continuar"
                  : "Únete a más de 1 millón de usuarios"}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Social Login */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                  type="button"
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Continuar con Google
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    type="button"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    type="button"
                  >
                    <Apple className="mr-2 h-4 w-4" />
                    Apple
                  </Button>
                </div>
              </div>

              <div className="flex items-center">
                <Separator className="flex-1 bg-white/20" />
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-gray-300">
                    O continúa con email
                  </span>
                </div>
                <Separator className="flex-1 bg-white/20" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Nombre completo
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) =>
                          setRememberMe(checked as boolean)
                        }
                        className="border-white/20 data-[state=checked]:bg-blue-600"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-gray-300"
                      >
                        Recordarme
                      </Label>
                    </div>
                    <Button
                      variant="link"
                      className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                    >
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                >
                  {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                </Button>
              </form>

              <div className="text-center">
                <span className="text-gray-300">
                  {isLogin
                    ? "¿No tienes una cuenta?"
                    : "¿Ya tienes una cuenta?"}
                </span>{" "}
                <Button
                  variant="link"
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto font-semibold"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Regístrate gratis" : "Inicia sesión"}
                </Button>
              </div>

              {!isLogin && (
                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  Al crear una cuenta, aceptas nuestros{" "}
                  <Button
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto text-xs"
                  >
                    Términos de Servicio
                  </Button>{" "}
                  y{" "}
                  <Button
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto text-xs"
                  >
                    Política de Privacidad
                  </Button>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
