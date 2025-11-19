"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Clock, MapPin, Plus } from 'lucide-react'
import { Header } from "@/components/header"
import { CustomerRegistration } from "@/components/worker/customer-registration"
import { obtenerClientesDeWorker } from "@/app/actions/clientes"
import { formatCurrencyPEN } from "@/lib/utils"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"
import { asignarClienteAWorkerAction } from "@/app/actions/clientes"
import type { Usuario } from "@/lib/database.types"

interface WorkerDashboardProps {
  usuario: Usuario
  onLogout: () => void
}

export function WorkerDashboard({ usuario, onLogout }: WorkerDashboardProps) {
  const [activeTab, setActiveTab] = useState("assignments")
  const [servicios, setServicios] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [showNewService, setShowNewService] = useState(false)
  const [misClientes, setMisClientes] = useState<any[]>([])
  const [newService, setNewService] = useState({
    cliente_id: "",
    descripcion: "",
    tipo: "instalacion" as const,
  })

  useEffect(() => {
    const cargarDatos = async () => {
      const supabase = createBrowserSupabaseClient()
      try {
        const { data: worker } = await supabase.from("workers").select("id").eq("profile_id", usuario.id).single()
        if (!worker) {
          setCargando(false)
          return
        }
        const { data: tickets } = await supabase
          .from("tickets")
          .select("id, title, description, status, priority, created_at, customer_id")
          .eq("assigned_worker", worker.id)
          .order("created_at", { ascending: false })
        const mapped = (tickets || []).map((t: any) => ({
          id: t.id,
          tipo: t.title,
          descripcion: t.description,
          estado:
            t.status === "open"
              ? "pendiente"
              : t.status === "in_progress"
              ? "en_progreso"
              : t.status === "resolved"
              ? "completado"
              : "cancelado",
          prioridad:
            t.priority === "low"
              ? "baja"
              : t.priority === "medium"
              ? "media"
              : t.priority === "high"
              ? "alta"
              : "urgente",
          fecha_programada: t.created_at,
        }))
        setServicios(mapped)

        const byReg = await supabase
          .from("customers")
          .select("id, profile_id, registered_by")
          .eq("registered_by", worker.id)
        const customerIdsFromTickets = Array.from(new Set((tickets || []).map((t: any) => t.customer_id).filter(Boolean)))
        const byTickets = customerIdsFromTickets.length
          ? await supabase.from("customers").select("id, profile_id, registered_by").in("id", customerIdsFromTickets)
          : { data: [] as any[] }
        const customers = Array.from(
          new Map([...(byReg.data || []), ...(byTickets.data || [])].map((c: any) => [c.id, c])).values(),
        )
        const profileIds = customers.map((c: any) => c.profile_id)
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", profileIds)
        const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
        const customerIds = customers.map((c: any) => c.id)
        const { data: subs } = await supabase
          .from("subscriptions")
          .select("customer_id, plan_id")
          .in("customer_id", customerIds)
        const planIds = Array.from(new Set((subs || []).map((s: any) => s.plan_id).filter(Boolean)))
        const { data: plans } = await supabase.from("plans").select("id, name, price").in("id", planIds)
        const planMap = new Map((plans || []).map((p: any) => [p.id, p]))
        const subsByCustomer = new Map(customerIds.map((id: string) => [id, null as any]))
        (subs || []).forEach((s: any) => subsByCustomer.set(s.customer_id, planMap.get(s.plan_id)))
        setMisClientes(customers.map((c: any) => ({ ...c, profile: profileMap.get(c.profile_id), plan: subsByCustomer.get(c.id) })))
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [usuario.id])

  const handleUpdateStatus = async (id: string, nuevoEstado: string) => {
    const supabase = createBrowserSupabaseClient()
    try {
      const status =
        nuevoEstado === "pendiente"
          ? "open"
          : nuevoEstado === "en_progreso"
          ? "in_progress"
          : nuevoEstado === "completado"
          ? "resolved"
          : "closed"
      const { error } = await supabase.from("tickets").update({ status }).eq("id", id)
      if (!error) setServicios(servicios.map((s) => (s.id === id ? { ...s, estado: nuevoEstado as any } : s)))
    } catch (error) {
      console.error("Error al actualizar servicio:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completado":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "en_progreso":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "pendiente":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const stats = [
    { title: "Total de Servicios", value: servicios.length.toString(), icon: MapPin },
    {
      title: "Completados",
      value: servicios.filter((s) => s.estado === "completado").length.toString(),
      icon: CheckCircle,
    },
    { title: "En Progreso", value: servicios.filter((s) => s.estado === "en_progreso").length.toString(), icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header usuario={usuario} onLogout={onLogout} />

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">Servicios Asignados</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="add-service">Nuevo Servicio</TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            {cargando ? (
              <div className="text-center py-8">Cargando servicios...</div>
            ) : servicios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No tienes servicios asignados</div>
            ) : (
              servicios.map((servicio) => (
                <Card key={servicio.id}>
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(servicio.estado)}
                          <h3 className="font-bold text-lg">{servicio.tipo}</h3>
                          <span className="text-xs sm:text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 px-2 py-1 rounded">
                            {servicio.prioridad}
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-2">{servicio.descripcion}</p>
                        {servicio.fecha_programada && (
                          <div className="text-sm text-muted-foreground">
                            Programado para: {new Date(servicio.fecha_programada).toLocaleDateString("es-CL")}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Select
                          value={servicio.estado}
                          onValueChange={(value) => handleUpdateStatus(servicio.id, value)}
                        >
                          <SelectTrigger className="w-28 sm:w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="en_progreso">En Progreso</SelectItem>
                            <SelectItem value="completado">Completado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="customers">
            <div className="flex justify-end mb-4">
              <div className="flex gap-3">
                <form
                  action={async (fd) => {
                    await asignarClienteAWorkerAction(fd)
                    // Recargar lista tras asignación
                    const supabase = createBrowserSupabaseClient()
                    const { data: worker } = await supabase.from("workers").select("id").eq("profile_id", usuario.id).single()
                    if (!worker) return
                    const { data: customers } = await supabase
                      .from("customers")
                      .select("id, profile_id, registered_by")
                      .eq("registered_by", worker.id)
                    const profileIds = (customers || []).map((c: any) => c.profile_id)
                    const { data: profiles } = await supabase
                      .from("profiles")
                      .select("id, full_name, email")
                      .in("id", profileIds)
                    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
                    setMisClientes((customers || []).map((c: any) => ({ ...c, profile: profileMap.get(c.profile_id) })))
                  }}
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="worker_profile_id" value={usuario.id} />
                  <Input name="email" placeholder="email del cliente" className="w-64" />
                  <Button type="submit">Asignar Cliente</Button>
                </form>
                <CustomerRegistration
                  onCustomerRegistered={(customer) => {
                    console.log("Cliente registrado:", customer)
                  }}
                />
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Mis Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                {misClientes.length === 0 ? (
                  <p className="text-muted-foreground">Aún no registras clientes</p>
                ) : (
                  <div className="space-y-4">
                    {misClientes.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{c.profile?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{c.profile?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{c.plan ? c.plan.name : "Sin plan"}</p>
                          {c.plan && <p className="text-xs text-muted-foreground">{formatCurrencyPEN(c.plan.price ?? 0)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Service Tab */}
          <TabsContent value="add-service">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Nuevo Servicio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Descripción del Servicio</label>
                    <Input
                      placeholder="Describe el servicio a realizar"
                      value={newService.descripcion}
                      onChange={(e) => setNewService({ ...newService, descripcion: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tipo de Servicio</label>
                    <Select
                      value={newService.tipo}
                      onValueChange={(value) => setNewService({ ...newService, tipo: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instalacion">Instalación</SelectItem>
                        <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="reparacion">Reparación</SelectItem>
                        <SelectItem value="consulta">Consulta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={() => setShowNewService(false)} className="w-full" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Guardar Servicio
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
