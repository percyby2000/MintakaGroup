"use server"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function obtenerServiciosPorTecnico(profileId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: worker } = await supabase.from("workers").select("id").eq("profile_id", profileId).single()
  if (!worker) return []

  const { data, error } = await supabase
    .from("tickets")
    .select("id, title, description, status, priority, created_at")
    .eq("assigned_worker", worker.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al obtener tickets:", error)
    return []
  }

  return (data || []).map((t: any) => ({
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
}

export async function actualizarServicio(id: string, nuevoEstado: "pendiente" | "en_progreso" | "completado" | "cancelado") {
  const supabase = await createServerSupabaseClient()

  const status =
    nuevoEstado === "pendiente"
      ? "open"
      : nuevoEstado === "en_progreso"
      ? "in_progress"
      : nuevoEstado === "completado"
      ? "resolved"
      : "closed"

  const { error } = await supabase.from("tickets").update({ status }).eq("id", id)
  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}
