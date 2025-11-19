"use server"

import { createServerSupabaseClient, createServerServiceRoleClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function loginWithEmail(email: string, password: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true, data }
}

export async function registrarTrabajador(
  email: string,
  password: string,
  nombre_completo: string,
  telefono: string,
  departamento: string,
  cargo: string,
) {
  const supabase = await createServerSupabaseClient()
  const adminClient = createServerServiceRoleClient()

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Error creating user" }
    }

    // 2. Create profile with worker role
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: authData.user.id,
      email,
      full_name: nombre_completo,
      phone: telefono,
      role: "worker",
    })

    if (profileError) {
      // Clean up auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: profileError.message }
    }

    // 3. Create worker record
    const { data: empCode } = await adminClient.rpc("generate_employee_code")

    const { data: workerData, error: workerError } = await adminClient
      .from("workers")
      .insert({
        profile_id: authData.user.id,
        employee_code: empCode ?? `EMP-${Date.now()}`,
        department: departamento,
        position: cargo,
        hire_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single()

    if (workerError) {
      return { success: false, error: workerError.message }
    }

    revalidatePath("/", "layout")
    return { success: true, data: workerData }
  } catch (err) {
    return { success: false, error: "Error creating worker" }
  }
}

export async function registrarCliente(
  email: string,
  password: string,
  nombre_completo: string,
  telefono: string,
  direccion: string,
  ciudad: string,
  dni: string,
  plan_id?: string,
) {
  const supabase = await createServerSupabaseClient()
  const adminClient = createServerServiceRoleClient()

  try {
    // Get current user to verify they are a worker
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return { success: false, error: "No autorizado" }
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Error creating user" }
    }

    // 2. Create profile with customer role
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: authData.user.id,
      email,
      full_name: nombre_completo,
      phone: telefono,
      role: "customer",
    })

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: profileError.message }
    }

    // 3. Get current worker
    const { data: workerData } = await supabase.from("workers").select("id").eq("profile_id", currentUser.id).single()

    // 4. Create customer record
    const { data: custCode } = await adminClient.rpc("generate_customer_code")

    const { data: customerData, error: customerError } = await adminClient
      .from("customers")
      .insert({
        profile_id: authData.user.id,
        customer_code: custCode ?? `CUS-${Date.now()}`,
        dni,
        address: direccion,
        city: ciudad,
        registered_by: workerData?.id,
      })
      .select()
      .single()

    if (customerError) {
      return { success: false, error: customerError.message }
    }

    // 5. If plan provided, create subscription
    if (plan_id) {
      const { data: plan } = await adminClient.from("plans").select("id").eq("id", plan_id).single()
      if (plan) {
        await adminClient.from("subscriptions").insert({
          customer_id: customerData.id,
          plan_id: plan_id,
          status: "active",
        })
      }
    }

    revalidatePath("/", "layout")
    return { success: true, data: customerData }
  } catch (err) {
    return { success: false, error: "Error creating customer" }
  }
}

export async function logout() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!userData) return null
  return { ...userData, rol: userData.role }
}
