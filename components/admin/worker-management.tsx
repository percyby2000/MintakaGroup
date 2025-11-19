"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Award } from "lucide-react"
import type { Worker } from "@/lib/database.types"

interface WorkerManagementProps {
  tecnicos: any[]
  onTecnicosActualizados: (tecnicos: any[]) => void
}

export function WorkerManagement({ tecnicos, onTecnicosActualizados }: WorkerManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [eliminando, setEliminando] = useState<string | null>(null)

  const filteredTecnicos = tecnicos.filter((tecnico) => {
    const name = tecnico.profile?.full_name ?? ""
    const dept = tecnico.department ?? ""
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || dept.toLowerCase().includes(searchTerm.toLowerCase())
    const estado = tecnico.is_active ? "disponible" : "inactivo"
    const matchesStatus = statusFilter === "all" || estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "disponible":
        return "Activo"
      case "inactivo":
        return "Inactivo"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponible":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100"
      case "inactivo":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Técnicos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar técnicos..."
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
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="ocupado">Ocupado</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold">Departamento</th>
                <th className="text-left py-3 px-4 font-semibold">Cargo</th>
                <th className="text-left py-3 px-4 font-semibold">Fecha Contratación</th>
                <th className="text-left py-3 px-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredTecnicos.map((tecnico) => (
                <tr key={tecnico.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{tecnico.profile?.full_name}</td>
                  <td className="py-3 px-4">{tecnico.department || "-"}</td>
                  <td className="py-3 px-4">{tecnico.position || "-"}</td>
                  <td className="py-3 px-4">{tecnico.hire_date}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tecnico.is_active ? "disponible" : "inactivo")}`}>
                      {getStatusLabel(tecnico.is_active ? "disponible" : "inactivo")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTecnicos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron técnicos que coincidan con tus criterios.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
