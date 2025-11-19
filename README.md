# MINTAKA SIS - Sistema de Gestión Integral

Sistema de gestión empresarial con roles de administrador, trabajadores y clientes.

## 🚀 Características

- 🔐 Autenticación con Supabase
- 👥 Sistema de roles (Admin, Worker, Customer)
- 📊 Dashboards personalizados por rol
- 🎨 Diseño moderno con Tailwind CSS
- 📱 Responsive design
- 🔄 Recuperación de contraseña

## 🛠️ Tecnologías

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (Base de datos y autenticación)
- **Tailwind CSS**
- **Shadcn/ui**

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/percyby2000/MintakaGroup.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

## 🔧 Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 Despliegue en Vercel

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno
3. ¡Despliega!

## 📝 Licencia
PERCY CONDE NUÑEZ
MIT