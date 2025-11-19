"use server"

import { createServerSupabaseClient, createServerServiceRoleClient } from "@/lib/supabase-server"
import type { Customer } from "@/lib/database.types"
import { revalidatePath } from "next/cache"

export async function obtenerClientes() {
  const supabase = await createServerSupabaseClient()
  const adminClient = createServerServiceRoleClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let client: typeof supabase = supabase
  if (user) {
    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (me?.role === "admin") client = adminClient as any
  }

  const { data: customers, error } = await client
    .from("customers")
    .select("id, profile_id, customer_code, dni, address, city, postal_code, is_active, created_at, updated_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al obtener clientes:", error)
    return []
  }

  if (!customers || customers.length === 0) return []

  const profileIds = customers.map((c: any) => c.profile_id)
  const { data: profiles } = await client.from("profiles").select("id, email, full_name, phone").in("id", profileIds)
  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

  const customerIds = customers.map((c: any) => c.id)
  const { data: subs } = await client
    .from("subscriptions")
    .select("id, status, customer_id")
    .in("customer_id", customerIds)

  const subsByCustomer = new Map(customerIds.map((id: string) => [id, [] as any[]]))
  ;(subs || []).forEach((s: any) => {
    const arr = subsByCustomer.get(s.customer_id)!
    arr.push(s)
  })

  return customers.map((c: any) => ({ ...c, profile: profileMap.get(c.profile_id), subscriptions: subsByCustomer.get(c.id) }))
}

export async function crearCliente(cliente: Omit<Customer, "id" | "created_at" | "updated_at">) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.from("customers").insert([cliente]).select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin")
  return { success: true, data }
}

export async function actualizarCliente(id: string, updates: Partial<Customer>) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.from("customers").update(updates).eq("id", id).select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin")
  return { success: true, data }
}

export async function eliminarCliente(id: string) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from("customers").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function obtenerClientePorId(id: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("customers")
    .select("id, customer_code, dni, address, city, postal_code, is_active, profile:profiles(id, email, full_name, phone)")
    .eq("id", id)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function obtenerPlanesActivos() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("plans")
    .select("id, name, price, features, is_active")
    .eq("is_active", true)
    .order("price", { ascending: true })

  if (error) {
    return []
  }

  return data || []
}

export async function obtenerClientesDeWorker(profileId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: worker } = await supabase.from("workers").select("id").eq("profile_id", profileId).single()
  if (!worker) return []

  const { data: customers } = await supabase
    .from("customers")
    .select("id, profile_id, customer_code, dni, address, city, is_active, created_at")
    .eq("registered_by", worker.id)
    .order("created_at", { ascending: false })

  if (!customers || customers.length === 0) return []

  const profileIds = customers.map((c: any) => c.profile_id)
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, phone").in("id", profileIds)
  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

  const customerIds = customers.map((c: any) => c.id)
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id, status, customer_id, plan_id")
    .in("customer_id", customerIds)

  const planIds = Array.from(new Set((subs || []).map((s: any) => s.plan_id).filter(Boolean)))
  const { data: plans } = await supabase.from("plans").select("id, name, price").in("id", planIds)
  const planMap = new Map((plans || []).map((p: any) => [p.id, p]))

  const subsByCustomer = new Map(customerIds.map((id: string) => [id, [] as any[]]))
  ;(subs || []).forEach((s: any) => {
    const arr = subsByCustomer.get(s.customer_id)!
    arr.push({ ...s, plan: planMap.get(s.plan_id) })
  })

  return customers.map((c: any) => ({ ...c, profile: profileMap.get(c.profile_id), subscriptions: subsByCustomer.get(c.id) }))
}

export async function obtenerPlanDelCliente(profileId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: customer } = await supabase.from("customers").select("id").eq("profile_id", profileId).single()
  if (!customer) return null

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, plan_id")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!sub || !sub.plan_id) return null

  const { data: plan } = await supabase
    .from("plans")
    .select("id, name, price, features, speed")
    .eq("id", sub.plan_id)
    .single()

  return plan || null
}

export async function asignarClienteAWorkerAction(formData: FormData) {
  const admin = createServerServiceRoleClient()

  const email = String(formData.get("email") || "").trim().toLowerCase()
  const workerProfileId = String(formData.get("worker_profile_id") || "")

  if (!email || !workerProfileId) {
    return { success: false, error: "Datos incompletos" }
  }

  const { data: worker } = await admin.from("workers").select("id").eq("profile_id", workerProfileId).single()
  if (!worker) return { success: false, error: "Técnico no encontrado" }

  const { data: profile } = await admin.from("profiles").select("id").eq("email", email).single()
  if (!profile) return { success: false, error: "Perfil de cliente no encontrado" }

  const { data: customer } = await admin.from("customers").select("id").eq("profile_id", profile.id).single()
  if (!customer) return { success: false, error: "Cliente no encontrado" }

  const { error } = await admin.from("customers").update({ registered_by: worker.id }).eq("id", customer.id)
  if (error) return { success: false, error: error.message }

  revalidatePath("/", "layout")
  return { success: true }
}
