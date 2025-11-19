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
      <CodeSessionStats attendances={attendances} />

      {(!attendances || attendances.length === 0) ? (
        <p className='dash-text-description'>No hay registros de asistencia aún.</p>
      ) : (
        <table className='attendance-table'>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Fecha de registro</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map(a => (
              <tr key={a.id} className='attendance-row'>
                <td className='attendance-cell name-cell'>{formatName(a.student)}</td>
                <td className='attendance-cell status-cell'><span className={statusClass(a.status)}>{statusLabel(a.status)}</span></td>
                <td className='attendance-cell time-cell'>{formatDate(a.registration_datetime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AttendanceList
