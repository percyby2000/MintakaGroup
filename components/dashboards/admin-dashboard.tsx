"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, DollarSign, TrendingUp } from 'lucide-react'
import { formatCurrencyPEN } from "@/lib/utils"
import { Header } from "@/components/header"
import { CustomerList } from "@/components/admin/customer-list"
import { WorkerManagement } from "@/components/admin/worker-management"
import { WorkerRegistration } from "@/components/admin/worker-registration"
import { obtenerClientes } from "@/app/actions/clientes"
import { obtenerTecnicos } from "@/app/actions/tecnicos"
import type { Usuario } from "@/lib/database.types"

interface AdminDashboardProps {
  usuario: Usuario
  onLogout: () => void
}

const chartData = [
  { month: "Ene", revenue: 4000, customers: 240, workers: 24 },
  { month: "Feb", revenue: 3000, customers: 221, workers: 22 },
  { month: "Mar", revenue: 2000, customers: 229, workers: 20 },
  { month: "Abr", revenue: 2780, customers: 200, workers: 21 },
  { month: "May", revenue: 1890, customers: 229, workers: 25 },
  { month: "Jun", revenue: 2390, customers: 200, workers: 24 },
]

const pieData = [
  { name: "Activo", value: 45, fill: "#3b82f6" },
  { name: "Inactivo", value: 15, fill: "#e5e7eb" },
  { name: "Pendiente", value: 10, fill: "#fbbf24" },
]

export function AdminDashboard({ usuario, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [clientes, setClientes] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [clientesData, tecnicosData] = await Promise.all([obtenerClientes(), obtenerTecnicos()])
        setClientes(clientesData)
        setTecnicos(tecnicosData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  const stats = [
    {
      title: "Total de Clientes",
      value: clientes.length.toString(),
      icon: Users,
      color: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Técnicos Activos",
      value: tecnicos.length.toString(),
      icon: Users,
      color: "bg-green-100 dark:bg-green-900",
    },
    { title: "Ingresos Mensuales", value: formatCurrencyPEN(142850), icon: DollarSign, color: "bg-emerald-100 dark:bg-emerald-900" },
    { title: "Crecimiento", value: "+12.5%", icon: TrendingUp, color: "bg-purple-100 dark:bg-purple-900" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header usuario={usuario} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}> 
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="workers">Técnicos</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencia de Ingresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Ingresos" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Estado de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Desempeño</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="customers" fill="#3b82f6" name="Clientes" />
                    <Bar dataKey="workers" fill="#10b981" name="Técnicos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <CustomerList clientes={clientes} onClientesActualizados={setClientes} />
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-6">
            <div className="flex justify-end">
              <WorkerRegistration
                onWorkerRegistered={(worker) => {
                  // Reload workers list
                  obtenerTecnicos().then(setTecnicos)
                }}
              />
            </div>
            <WorkerManagement tecnicos={tecnicos} onTecnicosActualizados={setTecnicos} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Desempeño Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#ec4899" name="Ingresos" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Crecimiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Adquisición de Clientes</span>
                    <span className="font-bold text-lg">+342</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Retención de Técnicos</span>
                    <span className="font-bold text-lg">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tiempo de Servicio</span>
                    <span className="font-bold text-lg">99.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Satisfacción del Cliente</span>
                    <span className="font-bold text-lg">4.8/5</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
