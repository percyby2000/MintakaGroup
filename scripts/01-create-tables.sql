-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'tecnico', 'cliente')),
  empresa VARCHAR(255),
  telefono VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  razon_social VARCHAR(255) NOT NULL,
  rut VARCHAR(20) NOT NULL UNIQUE,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  planes_activos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  especialidad VARCHAR(100) NOT NULL,
  zona_cobertura VARCHAR(100) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'inactivo')),
  clientes_asignados INTEGER DEFAULT 0,
  calificacion DECIMAL(3,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tecnico_id UUID REFERENCES tecnicos(id) ON DELETE SET NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('instalacion', 'mantenimiento', 'reparacion', 'consulta')),
  descripcion TEXT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'cancelado')),
  prioridad VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero VARCHAR(50) NOT NULL UNIQUE,
  monto DECIMAL(10,2) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida')),
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  concepto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor desempeño
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_clientes_usuario_id ON clientes(usuario_id);
CREATE INDEX idx_clientes_estado ON clientes(estado);
CREATE INDEX idx_tecnicos_usuario_id ON tecnicos(usuario_id);
CREATE INDEX idx_tecnicos_estado ON tecnicos(estado);
CREATE INDEX idx_servicios_cliente_id ON servicios(cliente_id);
CREATE INDEX idx_servicios_tecnico_id ON servicios(tecnico_id);
CREATE INDEX idx_servicios_estado ON servicios(estado);
CREATE INDEX idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX idx_facturas_estado ON facturas(estado);

-- Habilitar RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para usuarios
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Políticas de RLS para clientes (solo admins y el usuario propietario)
CREATE POLICY "Admins pueden ver todos los clientes" ON clientes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "Clientes pueden ver su propia información" ON clientes
  FOR SELECT USING (
    usuario_id = auth.uid() OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- Políticas de RLS para técnicos
CREATE POLICY "Admins y técnicos pueden ver técnicos" ON tecnicos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin', 'tecnico'))
  );

-- Políticas de RLS para servicios
CREATE POLICY "Los usuarios pueden ver sus servicios" ON servicios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clientes WHERE clientes.id = servicios.cliente_id AND clientes.usuario_id = auth.uid()
    ) OR
    usuario_id = auth.uid() OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- Políticas de RLS para facturas
CREATE POLICY "Los usuarios pueden ver sus facturas" ON facturas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clientes WHERE clientes.id = facturas.cliente_id AND clientes.usuario_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );
