"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { WorkerDashboard } from "@/components/dashboards/worker-dashboard"
import { ClientDashboard } from "@/components/dashboards/client-dashboard"
import { getCurrentUser } from "@/app/actions/auth"
import type { Usuario } from "@/lib/database.types"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const user = await getCurrentUser()
        setUsuario(user)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setCargando(false)
      }
    }
    cargarUsuario()
  }, [])

  const handleLoginSuccess = (user: Usuario) => {
    console.log("Login success:", user)
    setUsuario(user)
  }

  const handleLogout = async () => {
    const { logout } = await import("@/app/actions/auth")
    await logout()
    setUsuario(null)
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    )
  }

  if (!usuario) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  if (usuario.rol === "admin") {
    return <AdminDashboard usuario={usuario} onLogout={handleLogout} />
  }
  
  if (usuario.rol === "worker") {
    return <WorkerDashboard usuario={usuario} onLogout={handleLogout} />
  }
  
  if (usuario.rol === "customer") {
    return <ClientDashboard usuario={usuario} onLogout={handleLogout} />
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} />
}
