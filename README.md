# Proyecto Team Mugiwara 🏴‍☠️

## Miembros del Equipo

| Alumno | ID |
|--------|-----------|
| Jesús Alberto Morales Rojas | 00000245335 |
| José Karim Franco Valencia | 00000245138 |
| Jullian Herlenn Puerta | 00000248239 |
| Carlos Hiram Sanchez Meneses | 00000246787 |

## Tecnologías Utilizadas

### Frontend
- React
- TypeScript
- React Router
- Vite
- Django
- PostgreSQL

## Instalación y Ejecución

### Frontend

#### Crear archivo .env en front con el siguiente contenido
#### VITE_API_URL=http://localhost:8000/api/
#### VITE_LOCAL_STORAGE_ACCESS_TOKEN=access_token
#### VITE_LOCAL_STORAGE_REFRESH_TOKEN=refresh_token

```bash
cd frontend
npm install
npm run dev
```
### Backend
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
py manage.py migrate
py manage.py runserver
```
---

### Base de datos

#### 1.- Crea una base de datos posgrate y configura tu .env

### Una vez corra el servidor y se creen las tablas en la base de datos:
#### 1.- Ejecuta las prubas desde la carpeta pruebas 
#### 2.- desde postman, abre el archivo asistencia itson y ejecuta la insercion de cursos y usuarios
#### 3.- Ejecuta el script para poblar la base de datos con la asistencia de los alumnos

_Viva One Piece._