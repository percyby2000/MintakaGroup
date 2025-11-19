"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { registrarTrabajador } from "@/app/actions/auth"

interface WorkerRegistrationProps {
  onWorkerRegistered?: (worker: any) => void
}

export function WorkerRegistration({ onWorkerRegistered }: WorkerRegistrationProps) {
  const [open, setOpen] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")
  const [exito, setExito] = useState(false)

  const [formData, setFormData] = useState({
    nombre_completo: "",
    email: "",
    password: "",
    telefono: "",
    departamento: "",
    cargo: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setExito(false)
    setCargando(true)

    try {
      const resultado = await registrarTrabajador(
        formData.email,
        formData.password,
        formData.nombre_completo,
        formData.telefono,
        formData.departamento,
        formData.cargo,
      )

      if (resultado.success) {
        setExito(true)
        setFormData({
          nombre_completo: "",
          email: "",
          password: "",
          telefono: "",
          departamento: "",
          cargo: "",
        })

        if (onWorkerRegistered) {
          onWorkerRegistered(resultado.data)
        }

        setTimeout(() => {
          setOpen(false)
          setExito(false)
        }, 2000)
      } else {
        setError(resultado.error || "Error al registrar trabajador")
      }
    } catch (err) {
      setError("Error al registrar trabajador. Intenta de nuevo.")
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Técnico
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Técnico</DialogTitle>
          <DialogDescription>Completa el formulario para crear una nueva cuenta de técnico</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre Completo</label>
            <Input
              name="nombre_completo"
              placeholder="Juan Pérez"
              value={formData.nombre_completo}
              onChange={handleChange}
              disabled={cargando}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Correo Electrónico</label>
            <Input
              type="email"
              name="email"
              placeholder="juan@empresa.com"
              value={formData.email}
              onChange={handleChange}
              disabled={cargando}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <Input
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handleChange}
              disabled={cargando}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <Input
              name="telefono"
              placeholder="+56 9 1234 5678"
              value={formData.telefono}
              onChange={handleChange}
              disabled={cargando}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Departamento</label>
            <Input
              name="departamento"
              placeholder="Instalaciones"
              value={formData.departamento}
              onChange={handleChange}
              disabled={cargando}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Cargo</label>
            <Input
              name="cargo"
              placeholder="Técnico de Campo"
              value={formData.cargo}
              onChange={handleChange}
              disabled={cargando}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {exito && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">Técnico registrado exitosamente</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={cargando}>
            {cargando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Crear Técnico
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
