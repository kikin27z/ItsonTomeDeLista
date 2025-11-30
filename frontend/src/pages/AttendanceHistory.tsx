import { useState, useEffect } from "react"
import { useAuth } from "../hooks/auth-data"
import { format } from "date-fns"
import "./AttendanceHistory.css"
import { getAttendanceHistory } from "../services/api"

const COURSES = [{ id: 42, name: "Métodos Ágiles de Desarrollo" }]

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
  const [courseId, setCourseId] = useState<number>(42)
  const [dateRange, setDateRange] = useState<string>("last_week")
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!token || !user) return
    setLoading(true)
    const params = filterType === "course" ? { courseId } : { range: dateRange }
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
            <select value={courseId} onChange={(e) => setCourseId(Number(e.target.value))} className="filter-select">
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
                      <span className="detail-value">MÉTODOS AGILES</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Horario</span>
                      <span className="detail-value">{format(date, "HH:mm")}-19:30</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Aula</span>
                      <span className="detail-value">AY1825</span>
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