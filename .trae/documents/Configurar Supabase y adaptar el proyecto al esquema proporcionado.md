## Objetivo
Conectar el proyecto Next.js a tu instancia de Supabase y ajustar el código para usar tu esquema SQL (profiles, workers, customers, plans, subscriptions, installations, invoices, payments, tickets, ticket_comments, activity_logs), manteniendo la funcionalidad de alta de técnicos y clientes y el dashboard administrativo.

## Estado actual
- Ya se usa Supabase con `@supabase/ssr` y `@supabase/supabase-js`.
- Clientes en `lib/supabase.ts` y `lib/supabase-server.ts` leen `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Acciones de autenticación (`app/actions/auth.ts`) ya insertan en `profiles`, `workers`, `customers`.
- Otras acciones y tipos usan tablas en español (`clientes`, `tecnicos`, `servicios`) que no existen en tu esquema.
- Falta `.env.local` y el uso del Service Role para `auth.admin.createUser`.

## Configuración de entorno
1. Crear `.env.local` con:
   - `NEXT_PUBLIC_SUPABASE_URL=<tu-url>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>`
   - `SUPABASE_SERVICE_ROLE=<tu-service-role-key>` (solo servidor)
2. Verificar que las claves correspondan al proyecto donde ya ejecutaste tu SQL.

## Clientes de Supabase
1. Servidor (cookies, RLS usuario): mantener `createServerSupabaseClient` para operaciones del usuario autenticado.
2. Servidor (Service Role, sin cookies): añadir un cliente de administración que use `SUPABASE_SERVICE_ROLE` exclusivamente en servidor para:
   - `auth.admin.createUser`, `auth.admin.deleteUser`
   - inserciones que deban saltar RLS (creación de perfiles/trabajadores/clientes desde Admin)

## Tipos TypeScript
1. Sustituir `lib/database.types.ts` por tipos alineados a tu esquema:
   - `Profile`, `Worker`, `Customer`, `Plan`, `Subscription`, `Installation`, `Invoice`, `Payment`, `Ticket`, `TicketComment`, `ActivityLog`.
2. Opcional: generar tipos automáticamente con Supabase CLI (`supabase gen types typescript --linked`) y actualizarlos en el archivo.

## Ajustes en acciones (server actions)
1. `app/actions/auth.ts`:
   - Usar cliente Service Role para `auth.admin.createUser`/`deleteUser`.
   - Insertar en `profiles` con `role` del enum (`admin`, `worker`, `customer`).
   - `registrarTrabajador`: insertar en `workers` usando `profile_id`; generar `employee_code` con `rpc('generate_employee_code')`.
   - `registrarCliente`: validar usuario actual (worker/admin), insertar `profiles` (role `customer`), crear `customers` con `registered_by` (worker actual) y `customer_code` vía `rpc('generate_customer_code')`.
   - `getCurrentUser`: devolver `profiles` del usuario y ajustar el campo de rol para los dashboards.
2. `app/actions/clientes.ts` → usar `customers`:
   - `obtenerClientes`: `select` desde `customers` con join a `profiles(email, full_name)` y conteo de suscripciones activas (`subscriptions` con `status='active'`).
   - `crearCliente`, `actualizarCliente`, `eliminarCliente`: operar sobre `customers`.
3. `app/actions/tecnicos.ts` → usar `workers`:
   - `obtenerTecnicos`: `select` desde `workers` con join a `profiles(full_name, email)` y conteo de clientes asignados (`customers.registered_by = workers.id`).
   - `crearTecnico`, `actualizarTecnico`: operar sobre `workers`.
4. `app/actions/servicios.ts`:
   - Redirigir a la entidad adecuada de tu esquema:
     - Soporte: `tickets`/`ticket_comments`
     - Instalaciones: `installations`
     - Suscripciones: `subscriptions`
   - Ajustar selects y filtros al módulo que realmente usarás.

## Ajustes en componentes
1. `components/dashboards/admin-dashboard.tsx`:
   - Mantener estructura; las listas leerán de nuevas acciones.
2. `components/admin/customer-list.tsx`:
   - Mostrar `full_name`/`email` desde `profiles` asociados al `customer`.
   - Usar `dni` en lugar de `rut`; `is_active` como estado; `planes_activos` como conteo de `subscriptions` activas.
3. `components/admin/worker-management.tsx`:
   - Mostrar `department`, `position`, `is_active`, `hire_date`.
   - Reemplazar campos inexistentes (especialidad/zona/calzificación) por los del esquema.
4. `components/admin/worker-registration.tsx`:
   - Sin cambios de UI; la acción registrará en `profiles` y `workers` del nuevo esquema.
5. `app/page.tsx`:
   - Usar `profile.role` (`admin`/`worker`/`customer`) para resolver el dashboard correcto.

## Políticas y RLS
- Tu SQL ya habilita RLS y políticas por rol.
- Operaciones administrativas usarán Service Role (saltan RLS) y operaciones de usuario usarán el cliente SSR (respetan RLS).
- Verificar que lecturas necesarias estén cubiertas:
  - workers: admins pueden gestionar; workers pueden ver asignadas.
  - customers: workers y admins pueden ver; customers solo propias.
  - subscriptions/invoices/tickets: lecturas según tus políticas.

## Semillas iniciales
- Confirmar `INSERT INTO plans ...` en tu instancia (tu snippet quedó truncado). Añadir planes de ejemplo si falta.

## Verificación
1. Arrancar en local con las variables de entorno configuradas.
2. Iniciar sesión con un usuario admin existente.
3. Registrar un técnico y validar:
   - Existe en `auth.users`, `profiles` (role `worker`) y `workers`.
4. Registrar un cliente y validar:
   - Existe en `auth.users`, `profiles` (role `customer`) y `customers` (con `registered_by`).
5. Ver dashboards: listas de clientes y técnicos muestran datos del nuevo esquema sin errores.

## Entregables
- Variables de entorno configuradas.
- Cliente de Service Role en servidor.
- Acciones y tipos actualizados a tu esquema.
- Componentes ajustados para campos reales.
- Verificación manual funcionando con tu Supabase.

¿Confirmas que avancemos con estos cambios para aplicar la integración y las actualizaciones en el código?