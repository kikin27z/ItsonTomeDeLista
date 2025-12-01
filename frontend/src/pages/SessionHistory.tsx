import Box from '../components/dashboard/Box'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/auth-data'
import { GetCoursesAsocciatedTeacher, GetAttendanceHistory, ExportAttendancePDF, ExportAttendanceExcel, ExportAttendanceCSV } from '../services/api'
import type { Schedule } from '../types/academic.types'
import type { AttendanceHistoryResponse, AttendanceHistoryRecord } from '../types/attendance.types'

const SessionHistory = () => {
  const { user, token } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<string>('')
  const [historyData, setHistoryData] = useState<AttendanceHistoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!token || !user) return
      try {
        const data = await GetCoursesAsocciatedTeacher(token, user.username)
        setSchedules(data)
        if (data.length > 0) {
          setSelectedSchedule(data[0].id.toString())
        }
      } catch (err) {
        console.error('Failed to fetch schedules', err)
        setError('Error al cargar las materias')
      }
    }
    fetchSchedules()
  }, [token, user])

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token || !selectedSchedule) return
      setLoading(true)
      setError(null)
      try {
        const data = await GetAttendanceHistory(token, selectedSchedule)
        setHistoryData(data)
      } catch (err) {
        console.error('Failed to fetch attendance history', err)
        setError('Error al cargar el historial de asistencias')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [token, selectedSchedule])

  const groupedByStudent = () => {
    if (!historyData) return []
    
    const studentMap = new Map<string, { name: string; id: string; attendances: Map<string, string> }>()
    
    historyData.records.forEach((record) => {
      const studentId = record.student__unique_id
      const sessionDate = new Date(record.class_session__actual_start_time).toISOString()
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: record.complete_name,
          attendances: new Map()
        })
      }
      
      studentMap.get(studentId)!.attendances.set(sessionDate, record.status)
    })
    
    return Array.from(studentMap.values())
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'PRESENT':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )
      case 'LATE':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        )
      case 'JUSTIFIED':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        )
      case 'ABSENT':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        )
      default:
        return <span className='status-dash'>—</span>
    }
  }

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'PRESENT':
        return 'history-status-present'
      case 'LATE':
        return 'history-status-late'
      case 'JUSTIFIED':
        return 'history-status-justified'
      case 'ABSENT':
        return 'history-status-absent'
      default:
        return 'history-status-none'
    }
  }

  const calculateStats = (student: { attendances: Map<string, string> }) => {
    let present = 0, late = 0, absent = 0, justified = 0
    
    student.attendances.forEach((status) => {
      if (status === 'PRESENT') present++
      else if (status === 'LATE') late++
      else if (status === 'ABSENT') absent++
      else if (status === 'JUSTIFIED') justified++
    })
    
    return { present, late, absent, justified, total: present + late + absent + justified }
  }

  const handleExport = async () => {
    if (!token || !selectedSchedule) return
    setExporting(true)
    try {
      let blob: Blob
      let filename: string
      
      switch (exportFormat) {
        case 'pdf':
          blob = await ExportAttendancePDF(token, selectedSchedule)
          filename = `asistencia_${selectedSchedule}.pdf`
          break
        case 'excel':
          blob = await ExportAttendanceExcel(token, selectedSchedule)
          filename = `asistencia_${selectedSchedule}.xlsx`
          break
        case 'csv':
          blob = await ExportAttendanceCSV(token, selectedSchedule)
          filename = `asistencia_${selectedSchedule}.csv`
          break
        default:
          return
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting attendance', err)
      alert('Error al exportar el archivo')
    } finally {
      setExporting(false)
    }
  }

  const selectedScheduleData = schedules.find(s => s.id.toString() === selectedSchedule)
  const students = groupedByStudent()

  return (
    <main className='dash-main-container'>
      <div className='history-hero'>
        <div className='hero-content'>
          <h1 className='hero-title'>Historial de Sesiones</h1>
          <p className='hero-subtitle'>Consulta el registro completo de asistencias</p>
        </div>
      </div>

      <Box extraClasses='history-content'>
        <div className='history-header'>
          <div className='history-filter-section'>
            <label htmlFor='course-select' className='filter-label'>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Seleccionar Materia
            </label>
            <select
              id='course-select'
              className='history-select'
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
            >
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.course.name} - {schedule.classroom}
                </option>
              ))}
            </select>
          </div>

          {selectedScheduleData && (
            <div className='history-course-info'>
              <span className='course-info-item'>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {selectedScheduleData.days_of_week}
              </span>
              <span className='course-info-item'>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {selectedScheduleData.classroom}
              </span>
            </div>
          )}
        </div>

        {loading && (
          <div className='history-loading'>
            <div className='loading-spinner'></div>
            <p>Cargando historial...</p>
          </div>
        )}

        {error && (
          <div className='history-error'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && historyData && students.length === 0 && (
          <div className='history-empty'>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <p className='empty-title'>No hay registros de asistencia</p>
            <p className='empty-text'>Aún no se han registrado asistencias para esta materia</p>
          </div>
        )}

        {!loading && !error && historyData && students.length > 0 && (
          <>
            <div className='history-stats-summary'>
              <div className='summary-item'>
                <span className='summary-label'>Total de Sesiones</span>
                <span className='summary-value'>{historyData.headers.length}</span>
              </div>
              <div className='summary-item'>
                <span className='summary-label'>Estudiantes</span>
                <span className='summary-value'>{students.length}</span>
              </div>
            </div>

            <div className='history-table-container'>
              <table className='history-table'>
                <thead>
                  <tr>
                    <th className='sticky-col student-col'>Estudiante</th>
                    <th className='stats-col'>P</th>
                    <th className='stats-col'>T</th>
                    <th className='stats-col'>A</th>
                    <th className='stats-col'>J</th>
                    {historyData.headers.map((header, idx) => (
                      <th key={idx} className='date-col'>{formatDate(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const stats = calculateStats(student)
                    return (
                      <tr key={student.id}>
                        <td className='sticky-col student-name-cell'>
                          <div className='student-info'>
                            <div className='student-details'>
                              <span className='student-name'>{student.name}</span>
                              <span className='student-id'>{student.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className='stats-col-value stat-present'>{stats.present}</td>
                        <td className='stats-col-value stat-late'>{stats.late}</td>
                        <td className='stats-col-value stat-absent'>{stats.absent}</td>
                        <td className='stats-col-value stat-justified'>{stats.justified}</td>
                        {historyData.headers.map((header, idx) => {
                          const headerDate = new Date(header).toISOString()
                          const status = student.attendances.get(headerDate)
                          return (
                            <td key={idx} className={`attendance-status-cell ${getStatusClass(status)}`}>
                              {getStatusIcon(status)}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className='history-legend'>
              <span className='legend-title'>Leyenda:</span>
              <div className='legend-items'>
                <span className='legend-item'>
                  <span className='legend-icon history-status-present'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  Presente
                </span>
                <span className='legend-item'>
                  <span className='legend-icon history-status-late'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </span>
                  Tarde
                </span>
                <span className='legend-item'>
                  <span className='legend-icon history-status-absent'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                  Ausente
                </span>
                <span className='legend-item'>
                  <span className='legend-icon history-status-justified'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </span>
                  Justificada
                </span>
              </div>
            </div>

            <div className='export-section'>
              <h4 className='export-title'>FORMATO DE EXPORTACION</h4>
              <div className='export-format-options'>
                <button
                  className={`export-format-btn ${exportFormat === 'pdf' ? 'active' : ''}`}
                  onClick={() => setExportFormat('pdf')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path d="M14 2v6h6"/>
                    <path d="M9 13h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M9 17h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>PDF</span>
                </button>

                <button
                  className={`export-format-btn ${exportFormat === 'excel' ? 'active' : ''}`}
                  onClick={() => setExportFormat('excel')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path d="M14 2v6h6"/>
                    <rect x="8" y="12" width="8" height="2" fill="white"/>
                    <rect x="8" y="15" width="8" height="2" fill="white"/>
                  </svg>
                  <span>Excel</span>
                </button>

                <button
                  className={`export-format-btn ${exportFormat === 'csv' ? 'active' : ''}`}
                  onClick={() => setExportFormat('csv')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path d="M14 2v6h6"/>
                    <line x1="8" y1="13" x2="16" y2="13"/>
                    <line x1="8" y1="17" x2="16" y2="17"/>
                  </svg>
                  <span>CSV</span>
                </button>
              </div>

              <button 
                className='export-download-btn' 
                onClick={handleExport}
                disabled={exporting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {exporting ? 'Descargando...' : `Descargar en ${exportFormat.toUpperCase()}`}
              </button>
            </div>
          </>
        )}
      </Box>
    </main>
  )
}

export default SessionHistory
