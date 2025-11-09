# Documentación del Proyecto Frontend

## Variables de Entorno

VITE_API_URL=secreto
VITE_LOCAL_STORAGE_ACCESS_TOKEN=secreto
VITE_LOCAL_STORAGE_REFRESH_TOKEN=secreto

## Estructura del Proyecto
frontend/
│
├── public/                     # Archivos estáticos públicos
├── src/                        # Código fuente principal
│   ├── assets/                 # Recursos estáticos como imágenes, fuentes, etc.
│   ├── components/             # Componentes reutilizables
│   │   ├── dashboard/          # Componentes específicos para dashboard
│   │   ├── header/             # Componentes para el header o cabecera
│   │   ├── login/              # Componentes para login/autenticación
│   │   └── ProtectedRoute.tsx  # Componentes de rutas protegidas
│   ├── config/                 # Configuraciones de la app (variables, endpoints)
│   ├── context/                # Contextos de React para estado global
│   ├── hooks/                  # Hooks personalizados de React
│   ├── layout/                 # Componentes de layout (esquema de página)
│   ├── pages/                  # Vistas principales (corresponde a cada página)
│   ├── services/               # Lógica y llamadas a APIs (servicios)
│   ├── styles/                 # Archivos de estilos CSS/SASS globales
│   ├── types/                  # Tipos e interfaces de TypeScript
│   ├── App.tsx                 # Componente raíz de la aplicación
│   ├── index.css               # Estilos globales principales
│   └── main.tsx                # Punto de entrada de la aplicación
│
├── .env                        # Variables de entorno



### General

Viva One Piece.