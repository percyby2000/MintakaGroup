"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Zap, CreditCard, AlertCircle, FileText, Download, CheckCircle } from "lucide-react"
import { formatCurrencyPEN } from "@/lib/utils"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"
import { Header } from "@/components/header"
import type { Usuario } from "@/lib/database.types"

interface ClientDashboardProps {
  usuario: Usuario
  onLogout: () => void
}

export function ClientDashboard({ usuario, onLogout }: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState("account")
  const [cargando, setCargando] = useState(true)
  const [plan, setPlan] = useState<any | null>(null)

  useEffect(() => {
    const cargar = async () => {
      const supabase = createBrowserSupabaseClient()
      try {
        const { data: customer } = await supabase.from("customers").select("id").eq("profile_id", usuario.id).single()
        if (!customer) return setCargando(false)
        const { data: subs } = await supabase
          .from("subscriptions")
          .select("id, plan_id")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false })
          .limit(1)
        const current = subs?.[0]
        if (current?.plan_id) {
          const { data: p } = await supabase
            .from("plans")
            .select("id, name, price, features, speed")
            .eq("id", current.plan_id)
            .single()
          setPlan(p)
        }
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [usuario.id])

  const accountInfo = {
    accountNumber: "CTA-" + usuario.id.slice(0, 8).toUpperCase(),
    planType: plan?.name || "Sin plan",
    monthlyBill: plan?.price ?? 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Activo",
    dataUsage: "45.2 GB / 100 GB",
    speedTier: plan?.speed || "N/D",
  }

  const billingHistory = [
    { date: "2024-11-20", amount: 89.99, status: "Pagado" },
    { date: "2024-10-20", amount: 89.99, status: "Pagado" },
    { date: "2024-09-20", amount: 79.99, status: "Pagado" },
    { date: "2024-08-20", amount: 79.99, status: "Pagado" },
  ]

  const services = (plan?.features || []).map((f: any) => ({ name: f, status: "Activo", renewDate: accountInfo.dueDate }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <Header usuario={usuario} onLogout={onLogout} />

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estado de la Cuenta</p>
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                    <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">{accountInfo.status}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="p-5 sm:p-6">
              <div>
                <p className="text-sm text-muted-foreground">Uso de Datos</p>
                <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 mt-2">{accountInfo.dataUsage}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="p-5 sm:p-6">
              <div>
                <p className="text-sm text-muted-foreground">Próxima Fecha de Pago</p>
                <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 mt-2">{accountInfo.dueDate}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white dark:bg-gray-800">
            <TabsTrigger value="account" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Cuenta</TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Servicios</TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Facturación</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Soporte</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
                <CardTitle className="text-orange-600 dark:text-orange-400">Información de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Número de Cuenta</p>
                    <p className="font-mono text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">{accountInfo.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tipo de Plan</p>
                    <p className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">{accountInfo.planType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nivel de Velocidad</p>
                    <p className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">{accountInfo.speedTier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Factura Mensual</p>
                    <p className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">{formatCurrencyPEN(accountInfo.monthlyBill)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            {services.map((service, index) => (
              <Card key={index} className="border-orange-200 dark:border-orange-800">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-orange-600 dark:text-orange-400">{service.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Se renueva el {service.renewDate}</span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-100 px-3 py-1 rounded-full">
                      {service.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              <Zap className="mr-2 h-4 w-4" />
              Mejorar Plan
            </Button>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-orange-600 dark:text-orange-400">Factura Actual</span>
                  <span className="text-orange-600 dark:text-orange-400">{formatCurrencyPEN(accountInfo.monthlyBill)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-orange-200 dark:border-orange-800">
                  <span className="text-muted-foreground">Fecha de Vencimiento</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{accountInfo.dueDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">Vence Pronto</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <FileText className="h-5 w-5" />
                  Historial de Facturación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {billingHistory.map((bill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div>
                        <p className="font-medium text-orange-600 dark:text-orange-400">{bill.date}</p>
                        <p className="text-sm text-muted-foreground">{bill.status}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-orange-600 dark:text-orange-400">{formatCurrencyPEN(bill.amount)}</p>
                        <Button variant="ghost" size="sm" className="hover:bg-orange-100 dark:hover:bg-orange-900/40">
                          <Download className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              <CreditCard className="mr-2 h-4 w-4" />
              Realizar Pago
            </Button>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4">
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
                <CardTitle className="text-orange-600 dark:text-orange-400">Obtener Ayuda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-auto py-3 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    <div className="text-left">
                      <p className="font-semibold text-orange-600 dark:text-orange-400">Contactar Soporte</p>
                      <p className="text-xs text-muted-foreground">Llámanos al 1-800-TELECOM o envía un correo</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-auto py-3 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    <div className="text-left">
                      <p className="font-semibold text-orange-600 dark:text-orange-400">Ver Preguntas Frecuentes</p>
                      <p className="text-xs text-muted-foreground">Encuentra respuestas a preguntas comunes</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-auto py-3 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    <div className="text-left">
                      <p className="font-semibold text-orange-600 dark:text-orange-400">Reportar Problema</p>
                      <p className="text-xs text-muted-foreground">Reporta problemas de servicio o interrupciones</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
              <CardContent className="p-5 sm:p-6 flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-900 dark:text-orange-100">
                  <p className="font-semibold">Aviso de Mantenimiento</p>
                  <p className="mt-1">
                    El mantenimiento programado está previsto para el 22 de diciembre de 2 a 4 AM EST. Los servicios
                    pueden no estar disponibles temporalmente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
