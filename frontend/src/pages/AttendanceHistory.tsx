import { useState, useEffect } from "react"
import { useAuth } from "../hooks/auth-data"
import { format } from "date-fns"
import "./AttendanceHistory.css"
import { getAttendanceHistory, GetEnrollmentsStudent } from "../services/api"
import type { Enrollment } from "../types/academic.types"

const FILTERS = [
  { value: "last_week", label: "Última semana" },
  { value: "last_month", label: "Último mes" },
  { value: "semester", label: "Semestre" },
]

type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT"

interface StatusInfo {
  color: string
  label: string
  icon: string
}

const STATUS: Record<AttendanceStatus, StatusInfo> = {
  PRESENT: { color: "#2ecc40", label: "PRESENTE", icon: "" },
  LATE: { color: "#f1c40f", label: "RETARDO", icon: "" },
  ABSENT: { color: "#ff4136", label: "AUSENTE", icon: "" },
}

function getStatusInfo(status: string): StatusInfo {
  return STATUS[status as AttendanceStatus] || { color: "#ccc", label: status, icon: "" }
}

interface Attendance {
  id: number
  class_session: {
    actual_start_time: string
  }
  status: AttendanceStatus | string
  registration_datetime: string
  student: number
}

const AttendanceHistory = () => {
  const { token, user } = useAuth()
  const [filterType, setFilterType] = useState<"course" | "date">("course")
  const [courseId, setCourseId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<string>("last_week")
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loadingEnrollments, setLoadingEnrollments] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar enrollments del estudiante
  useEffect(() => {
    if (!token || !user) return
    setLoadingEnrollments(true)
    GetEnrollmentsStudent(token, user.username)
      .then((data) => {
        setEnrollments(data)
        // Seleccionar el primer curso por defecto si no hay uno
        if (data.length > 0 && courseId === null) {
          setCourseId(data[0].course.id)
        }
      })
      .catch((e) => {
        console.error("Error obteniendo enrollments", e)
        setError("No se pudieron cargar las materias")
        setEnrollments([])
      })
      .finally(() => setLoadingEnrollments(false))
  }, [token, user])

  useEffect(() => {
    if (!token || !user) return
    // Si estamos filtrando por curso y aún no hay courseId (porque no llegó enrollments), no ejecutar
    if (filterType === "course" && courseId === null) return
    setLoading(true)
    const params = filterType === "course" ? { courseId: courseId! } : { range: dateRange }
    getAttendanceHistory(token, user.username, params)
      .then((data) => setAttendances(data))
      .catch((error) => {
        console.error("Error al cargar asistencias:", error)
        setAttendances([])
      })
      .finally(() => setLoading(false))
  }, [token, user, courseId, dateRange, filterType])

  return (
    <div className="attendance-history-container">
      <h2 className="attendance-history-title">Mi historial de asistencia</h2>

      <div className="attendance-history-filters">
        <div className="filter-button-group">
          <button
            className={`filter-btn${filterType === "course" ? " active" : ""}`}
            onClick={() => setFilterType("course")}
          >
            ▼ Por materia
          </button>
          <button
            className={`filter-btn${filterType === "date" ? " active" : ""}`}
            onClick={() => setFilterType("date")}
          >
            ▼ Por rango de fechas
          </button>
        </div>

        <div className="filter-selector-wrapper">
          {filterType === "course" ? (
            loadingEnrollments ? (
              <p className="attendance-loading">Cargando materias...</p>
            ) : error ? (
              <p className="attendance-error">{error}</p>
            ) : (
              <select
                value={courseId ?? ''}
                onChange={(e) => setCourseId(Number(e.target.value))}
                className="filter-select"
                disabled={enrollments.length === 0}
              >
                {enrollments.map((en) => (
                  <option key={en.id} value={en.course.id}>
                    {en.course.name}
                  </option>
                ))}
              </select>
            )
          ) : (
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="filter-select">
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="attendance-timeline">
        {loading ? (
          <p className="attendance-loading">Cargando...</p>
        ) : attendances.length === 0 ? (
          <p className="attendance-empty">No hay registros.</p>
        ) : (
          attendances.map((a) => {
            const info = getStatusInfo(a.status)
            const date = new Date(a.class_session.actual_start_time)
            // Encontrar datos de la materia seleccionada
            const selectedEnrollment = enrollments.find((en) => en.course.id === courseId)
            const courseName = selectedEnrollment ? (selectedEnrollment.course.name || '').toUpperCase() : 'MATERIA'
            const scheduleRange = selectedEnrollment
              ? `${selectedEnrollment.start_time}-${selectedEnrollment.end_time}`
              : `${format(date, 'HH:mm')}`
            const classroom = selectedEnrollment ? selectedEnrollment.classroom : 'AULA'
            return (
              <div className="attendance-item" key={a.id}>
                <div className="timeline-icon" style={{ background: info.color }}>
                  {info.icon}
                </div>
                <div className="attendance-card">
                  <div className="attendance-header">
                    <span className="attendance-date">
                      {date
                        .toLocaleDateString("es-MX", {
                          weekday: "short",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                        .toUpperCase()}
                    </span>
                    <span className="attendance-status" style={{ background: info.color }}>
                      {info.label}
                    </span>
                  </div>
                  <div className="attendance-details">
                    <div className="detail-item">
                      <span className="detail-label">Clase</span>
                      <span className="detail-value">{courseName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Horario</span>
                      <span className="detail-value">{scheduleRange}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Aula</span>
                      <span className="detail-value">{classroom}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default AttendanceHistory