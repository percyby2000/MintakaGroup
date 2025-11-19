"use server"

import { createServerSupabaseClient, createServerServiceRoleClient } from "@/lib/supabase-server"
import type { Worker } from "@/lib/database.types"
import { revalidatePath } from "next/cache"

export async function obtenerTecnicos() {
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

  const { data: workers, error } = await client
    .from("workers")
    .select("id, profile_id, employee_code, department, position, is_active, hire_date, created_at, updated_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al obtener técnicos:", error)
    return []
  }

  if (!workers || workers.length === 0) return []

  const profileIds = workers.map((w: any) => w.profile_id)
  const { data: profiles } = await client.from("profiles").select("id, full_name, email, phone").in("id", profileIds)
  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

  return workers.map((w: any) => ({ ...w, profile: profileMap.get(w.profile_id) }))
}

export async function crearTecnico(tecnico: Omit<Worker, "id" | "created_at" | "updated_at">) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.from("workers").insert([tecnico]).select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin")
  return { success: true, data }
}

export async function actualizarTecnico(id: string, updates: Partial<Worker>) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.from("workers").update(updates).eq("id", id).select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin")
  return { success: true, data }
}

export async function obtenerTecnicosPorEspecialidad(especialidad: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("workers")
    .select("id, employee_code, department, position, is_active, hire_date, profile:profiles(id, full_name, email)")
    .eq("position", especialidad)
    .eq("is_active", true)

  if (error) {
    return []
  }

  return data || []
}
