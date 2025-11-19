"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Trash2, Loader2 } from "lucide-react"
import { eliminarCliente } from "@/app/actions/clientes"

interface CustomerListProps {
  clientes: any[]
  onClientesActualizados: (clientes: any[]) => void
}

export function CustomerList({ clientes, onClientesActualizados }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cargando, setCargando] = useState(false)
  const [eliminando, setEliminando] = useState<string | null>(null)

  const filteredClientes = clientes.filter((cliente) => {
    const name = cliente.profile?.full_name ?? ""
    const email = cliente.profile?.email ?? ""
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase())
    const estado = cliente.is_active ? "activo" : "inactivo"
    const matchesStatus = statusFilter === "all" || estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDeleteCliente = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) return

    setEliminando(id)
    try {
      const resultado = await eliminarCliente(id)
      if (resultado.success) {
        onClientesActualizados(clientes.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
    } finally {
      setEliminando(null)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "activo":
        return "Activo"
      case "inactivo":
        return "Inactivo"
      case "suspendido":
        return "Suspendido"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100"
      case "inactivo":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100"
      case "suspendido":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Clientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="suspendido">Suspendido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold">Correo</th>
                <th className="text-left py-3 px-4 font-semibold">DNI</th>
                <th className="text-left py-3 px-4 font-semibold">Estado</th>
                <th className="text-left py-3 px-4 font-semibold">Suscripciones Activas</th>
                <th className="text-left py-3 px-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{cliente.profile?.full_name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{cliente.profile?.email}</td>
                  <td className="py-3 px-4">{cliente.dni}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(cliente.is_active ? "activo" : "inactivo")}`}>
                      {getStatusLabel(cliente.is_active ? "activo" : "inactivo")}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{(cliente.subscriptions || []).filter((s: any) => s.status === "active").length}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCliente(cliente.id)}
                      disabled={eliminando === cliente.id}
                      className="text-destructive"
                    >
                      {eliminando === cliente.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClientes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron clientes que coincidan con tus criterios.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
