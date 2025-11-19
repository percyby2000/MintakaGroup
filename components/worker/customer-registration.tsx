"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { registrarCliente } from "@/app/actions/auth"
import { obtenerPlanesActivos } from "@/app/actions/clientes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrencyPEN } from "@/lib/utils"

interface CustomerRegistrationProps {
  onCustomerRegistered?: (customer: any) => void
}

export function CustomerRegistration({ onCustomerRegistered }: CustomerRegistrationProps) {
  const [open, setOpen] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")
  const [exito, setExito] = useState(false)

  const [formData, setFormData] = useState({
    nombre_completo: "",
    email: "",
    password: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    dni: "",
    plan_id: "",
  })
  const [planes, setPlanes] = useState<any[]>([])

  useEffect(() => {
    const cargarPlanes = async () => {
      const data = await obtenerPlanesActivos()
      setPlanes(data)
    }
    if (open) cargarPlanes()
  }, [open])

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
      const resultado = await registrarCliente(
        formData.email,
        formData.password,
        formData.nombre_completo,
        formData.telefono,
        formData.direccion,
        formData.ciudad,
        formData.dni,
        formData.plan_id || undefined,
      )

      if (resultado.success) {
        setExito(true)
        setFormData({
          nombre_completo: "",
          email: "",
          password: "",
          telefono: "",
          direccion: "",
          ciudad: "",
          dni: "",
          plan_id: "",
        })

        if (onCustomerRegistered) {
          onCustomerRegistered(resultado.data)
        }

        setTimeout(() => {
          setOpen(false)
          setExito(false)
        }, 2000)
      } else {
        setError(resultado.error || "Error al registrar cliente")
      }
    } catch (err) {
      setError("Error al registrar cliente. Intenta de nuevo.")
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Cliente
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
          <DialogDescription>Completa el formulario para registrar un nuevo cliente</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre Completo</label>
            <Input
              name="nombre_completo"
              placeholder="Carlos García"
              value={formData.nombre_completo}
              onChange={handleChange}
              disabled={cargando}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">DNI/RUT</label>
            <Input
              name="dni"
              placeholder="12.345.678-9"
              value={formData.dni}
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
              placeholder="carlos@email.com"
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
            <label className="text-sm font-medium">Dirección</label>
            <Input
              name="direccion"
              placeholder="Calle Principal 123"
              value={formData.direccion}
              onChange={handleChange}
              disabled={cargando}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Ciudad</label>
            <Input
              name="ciudad"
              placeholder="Santiago"
              value={formData.ciudad}
              onChange={handleChange}
              disabled={cargando}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Plan</label>
            <Select value={formData.plan_id} onValueChange={(v) => setFormData({ ...formData, plan_id: v })} disabled={cargando}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent>
                {planes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} • {formatCurrencyPEN(p.price ?? 0)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Se crea suscripción activa con el plan seleccionado</p>
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
              <AlertDescription className="text-green-600">Cliente registrado exitosamente</AlertDescription>
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
                Crear Cliente
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
