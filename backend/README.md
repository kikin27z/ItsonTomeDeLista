# Documentación del Proyecto Backend

## Variables de Entorno

Crea un archivo `.env` en la raíz del backend con las siguientes variables:
```env
# Django
SECRET_KEY=tu_clave_secreta_django
DEBUG=True
ALLOWED_HOSTS=http://localhost:5173

# PostgreSQL
DB_NAME=nombre_base_datos
DB_USER=usuario_db
DB_PASSWORD=contraseña_db
DB_HOST=localhost
DB_PORT=5432

# CORS - Orígenes permitidos
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Estructura del Proyecto
```
backend/
│
├── .venv/                     # Entorno virtual de Python
│
├── academic/                  # App de académicos
│   ├── migrations/            # Migraciones de base de datos
│   ├── __pycache__/          # Archivos compilados de Python
│   ├── __init__.py           # Inicializador del módulo
│   ├── admin.py              # Configuración del admin de Django
│   ├── apps.py               # Configuración de la app
│   ├── models.py             # Modelos de base de datos
│   ├── serializers.py        # Serializadores de Django REST
│   ├── tests.py              # Pruebas unitarias
│   ├── urls.py               # URLs de la app
│   └── views.py              # Vistas y lógica de negocio
│
├── attendance/                # App de asistencias
│   └── ...                   # Estructura similar a academic
│
├── backend/                   # Configuración principal del proyecto
│   ├── __init__.py
│   ├── settings.py           # Configuración de Django
│   ├── urls.py               # URLs principales
│   ├── wsgi.py               # Configuración WSGI
│   └── asgi.py               # Configuración ASGI
│
├── users/                     # App de usuarios
│   └── ...                   # Estructura similar a academic
│
├── .env                       # Variables de entorno
├── .gitignore                # Archivos ignorados por Git
├── manage.py                 # Script de administración de Django
├── README.md                 # Esta documentación
└── requirements.txt          # Dependencias de Python
```

## Instalación y Configuración

### 1. Crear entorno virtual
```bash
python -m venv .venv
```

### 2. Activar entorno virtual

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar base de datos

Asegúrate de tener PostgreSQL instalado y crea una base de datos. Luego ejecuta las migraciones:
```bash
py manage.py migrate
```

### 5. Crear superusuario (opcional)
```bash
py manage.py createsuperuser
```

### 6. Ejecutar servidor de desarrollo
```bash
py manage.py runserver
```

El servidor estará disponible en `http://localhost:8000`

## Tecnologías Principales

- **Django** - Framework web de Python
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de datos
- **python-decouple** - Gestión de variables de entorno

## Apps del Proyecto

- **academic** - Gestión de información académica
- **attendance** - Sistema de asistencias
- **users** - Gestión de usuarios y autenticación

## Comandos Útiles
```bash
# Crear una nueva app
py manage.py startapp nombre_app

# Crear migraciones
py manage.py makemigrations

# Aplicar migraciones
py manage.py migrate

# Abrir shell de Django
py manage.py shell

# Ejecutar tests
py manage.py test
```

## API Endpoints

El backend expone una API REST. Consulta cada app para ver sus endpoints específicos:

- `/api/academic/` - Endpoints académicos
- `/api/attendance/` - Endpoints de asistencias
- `/api/users/` - Endpoints de usuarios

---

**Team:** Mugiwara 🏴‍☠️

_Viva One Piece._