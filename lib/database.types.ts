export type Usuario = {
  id: string
  email: string
  full_name: string
  rol: "admin" | "worker" | "customer"
  phone?: string
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string
  phone?: string
  role: "admin" | "worker" | "customer"
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type Worker = {
  id: string
  profile_id: string
  employee_code: string
  department?: string
  position?: string
  hire_date: string
  assigned_by?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Customer = {
  id: string
  profile_id: string
  customer_code: string
  dni?: string
  address: string
  city: string
  postal_code?: string
  latitude?: number | null
  longitude?: number | null
  registered_by?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
