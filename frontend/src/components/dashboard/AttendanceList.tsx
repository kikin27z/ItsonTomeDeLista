import React from 'react'
import CodeSessionStats from './CodeSessionStats'

type Attendance = {
  id: number
  student: { first_name?: string; middle_name?: string | null; surname?: string }
  status: string
  registration_datetime?: string | null
}

type Props = {
  attendances: Attendance[]
}

const formatName = (s: Attendance['student']) => {
  const parts = [s.first_name, s.middle_name, s.surname].filter(Boolean)
  return parts.join(' ')
}

const formatDate = (d?: string | null) => {
  if (!d) return ''
  try {
    const dt = new Date(d)
    return dt.toLocaleString()
  } catch {
    return d
  }
}

const statusClass = (status: string) => {
  switch (status) {
    case 'PRESENT':
      return 'att-status present'
    case 'LATE':
      return 'att-status late'
    case 'JUSTIFIED':
      return 'att-status justified'
    default:
      return 'att-status absent'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'PRESENT':
      return 'PRESENTE'
    case 'ABSENT':
      return 'AUSENTE'
    case 'LATE':
      return 'TARDE'
    case 'JUSTIFIED':
      return 'JUSTIFICADA'
    default:
      return status
  }
}

const AttendanceList = ({ attendances }: Props) => {
  return (
    <div className='attendance-list'>
      <div className='attendance-header'>
        <h4 className='attendance-title'>Lista de Asistencia</h4>
        <span className='attendance-count'>{attendances?.length || 0} registros</span>
      </div>

      <CodeSessionStats attendances={attendances} />

      {(!attendances || attendances.length === 0) ? (
        <div className='attendance-empty-state'>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          <p className='empty-state-text'>No hay registros de asistencia aún</p>
          <p className='empty-state-subtext'>Los estudiantes aparecerán aquí cuando registren su asistencia</p>
        </div>
      ) : (
        <div className='attendance-table-wrapper'>
          <table className='attendance-table'>
            <thead>
              <tr>
                <th className='th-name'>Estudiante</th>
                <th className='th-status'>Estado</th>
                <th className='th-time'>Hora de Registro</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map(a => (
                <tr key={a.id} className='attendance-row'>
                  <td className='attendance-cell name-cell'>
                    <div className='student-avatar'>{formatName(a.student).charAt(0).toUpperCase()}</div>
                    <span className='student-name'>{formatName(a.student)}</span>
                  </td>
                  <td className='attendance-cell status-cell'>
                    <span className={statusClass(a.status)}>{statusLabel(a.status)}</span>
                  </td>
                  <td className='attendance-cell time-cell'>{formatDate(a.registration_datetime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AttendanceList
