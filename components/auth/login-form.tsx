"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginWithEmail } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Lock, AlertCircle, Loader2, User, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginFormProps {
  onLoginSuccess: (user: any) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)
  const [imageError, setImageError] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCargando(true)

    try {
      const resultado = await loginWithEmail(email, password)

      if (resultado.success && resultado.data?.user) {
        onLoginSuccess(resultado.data.user)

        setTimeout(() => {
          router.refresh()
          window.location.reload()
        }, 100)
      } else {
        setError(resultado.error || "Error al iniciar sesión")
        setCargando(false)
      }
    } catch (err) {
      setError("Error al iniciar sesión")
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-500 to-orange-600">
      {!imageError && (
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-3xl"></div>
          <img 
            src="/blue.png" 
            alt="MINTAKA" 
            className="relative z-10 max-w-2xl w-full h-auto object-contain drop-shadow-2xl"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      <div className={`w-full ${imageError ? 'lg:w-full' : 'lg:w-1/2'} flex items-center justify-center p-4`}>
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className="flex justify-center">
              <img src="/logo.png" alt="MINTAKA" className="h-20 w-auto mx-auto" />
            </div>
          </CardHeader>

          <CardContent className="pt-3">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={cargando}
                  required
                  className="pl-10 h-12"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={cargando}
                  required
                  className="pl-10 h-12"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-orange-600 hover:bg-orange-700"
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-white hover:underline"
                >
                  ¿Olvidé mi contraseña?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
