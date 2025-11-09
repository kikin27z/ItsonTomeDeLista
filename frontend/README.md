# Documentación del Proyecto Frontend

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
VITE_API_URL=tu_url_api
VITE_LOCAL_STORAGE_ACCESS_TOKEN=tu_clave_access_token
VITE_LOCAL_STORAGE_REFRESH_TOKEN=tu_clave_refresh_token
```

## Estructura del Proyecto
```
frontend/
│
├── public/                     # Archivos estáticos públicos
│
├── src/                        # Código fuente principal
│   │
│   ├── assets/                 # Recursos estáticos (imágenes, fuentes, etc.)
│   │
│   ├── components/             # Componentes reutilizables
│   │   ├── dashboard/          # Componentes específicos para dashboard
│   │   ├── header/             # Componentes para el header o cabecera
│   │   ├── login/              # Componentes para login/autenticación
│   │   └── ProtectedRoute.tsx  # Componente de rutas protegidas
│   │
│   ├── config/                 # Configuraciones de la app (variables, endpoints)
│   │
│   ├── context/                # Contextos de React para estado global
│   │
│   ├── hooks/                  # Hooks personalizados de React
│   │
│   ├── layout/                 # Componentes de layout (esquema de página)
│   │
│   ├── pages/                  # Vistas principales (cada página de la app)
│   │
│   ├── services/               # Lógica y llamadas a APIs (servicios)
│   │
│   ├── styles/                 # Archivos de estilos CSS/SASS globales
│   │
│   ├── types/                  # Tipos e interfaces de TypeScript
│   │
│   ├── App.tsx                 # Componente raíz de la aplicación
│   │
│   ├── index.css               # Estilos globales principales
│   │
│   └── main.tsx                # Punto de entrada de la aplicación
│
├── .env                        # Variables de entorno
│
├── package.json                # Dependencias y scripts del proyecto
│
└── vite.config.ts              # Configuración de Vite
```

## Instalación
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

## Tecnologías Principales

- **React** - Biblioteca de UI
- **TypeScript** - Superset tipado de JavaScript
- **React Router** - Navegación y enrutamiento
- **Vite** - Build tool y servidor de desarrollo

### General

**Team:** Mugiwara 🏴‍☠️

_Viva One Piece._