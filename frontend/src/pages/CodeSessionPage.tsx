import Box from '../components/dashboard/Box'
import CodeBox from '../components/dashboard/CodeBox'
import CodeSessionStats from '../components/dashboard/CodeSessionStats'
import { useLocation, useParams } from 'react-router'
import { useEffect, useState } from 'react'
import type { Schedule } from '../types/academic.types'
import { GetScheduleById, CreateClassSession, GetClassSessionToday } from '../services/api'
import AttendanceList from '../components/dashboard/AttendanceList'
import { useAuth } from '../hooks/auth-data'
import { convertTo12HourFormat } from '../utils/pipe-datetimes'

const CodeSessionPage = () => {
    const { state } = useLocation()
    const params = useParams()
    const { token } = useAuth()
    
    const [schedule, setSchedule] = useState<Schedule | null>(state?.schedule ?? null)
    const [loading, setLoading] = useState<boolean>(!state?.schedule)
    const [attendanceCode, setAttendanceCode] = useState<string | null>(null)
    const [session, setSession] = useState<any | null>(null)

    useEffect(() => {
        const load = async () => {
            // Only fetch schedule details on mount (do not fetch or create session automatically)
            if (!token) return
            setLoading(true)
            try {
                if (!schedule) {
                    const id = params.id!
                    const data = await GetScheduleById(token, id)
                    setSchedule(data)
                }
            } catch (err) {
                console.error('Error fetching schedule', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [schedule, token, params.id])

    // Handler to create/open a new class session when user clicks the button
    const handleOpenSession = async () => {
        if (!token || !schedule) return
        setLoading(true)
        try {
            const sessionResp = await CreateClassSession(token, String(schedule.id))
            if (sessionResp) {
                if (sessionResp.attendance_code) setAttendanceCode(sessionResp.attendance_code)
                setSession(sessionResp)
            }
        } catch (err: any) {
            // If session already created, try to fetch it and use it
            if (err?.response?.status === 400) {
                try {
                    const existing = await GetClassSessionToday(token, String(schedule.id))
                    if (existing && existing.attendance_code) {
                        setAttendanceCode(existing.attendance_code)
                        setSession(existing)
                    }
                } catch (e) {
                    console.error('Failed to fetch existing session after create returned 400', e)
                }
            } else {
                console.error('Failed to create class session', err)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleCloseSession = () => {
        // Backend endpoint to close a session does not exist yet; simulate closing locally.
        setSession(null)
        setAttendanceCode(null)
    }

    const handleFetchExistingSession = async () => {
        if (!token || !schedule) return
        setLoading(true)
        try {
            const existing = await GetClassSessionToday(token, String(schedule.id))
            if (existing && existing.attendance_code) {
                setAttendanceCode(existing.attendance_code)
                setSession(existing)
            }
        } catch (err: any) {
            console.error('Error fetching today session', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <p>Loading...</p>

    return (
        <main className='dash-main-container'>
            <Box extraClasses='dash-stats-container'>
                <article>
                    <h3>{schedule?.course?.name ?? 'Curso'}</h3>
                    <p className='dash-text-description'>{schedule ? `${schedule.days_of_week} ${convertTo12HourFormat(schedule.start_time)} - ${convertTo12HourFormat(schedule.end_time)}` : ''}, {schedule?.classroom} </p>
                    {attendanceCode && session ? (
                        <>
                            <CodeBox code={attendanceCode} />
                            <p className='dash-text-description txt-c'>Los alumnos pueden ingresar el número para registrar asistencia</p>
                        </>
                    ) : (
                        <p className='dash-text-description txt-c'>No hay sesión de asistencia abierta. Presiona el botón para abrir una.</p>
                    )}

                    <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                        {session && session.status === 'ACTIVE' ? (
                            <button className='dash-btn dash-btn-close-sesion' onClick={handleCloseSession}>Cerrar sesión de Asistencia</button>
                        ) : (
                            <button className='dash-btn dash-btn-style1' onClick={handleOpenSession}>Abrir sesión de Asistencia</button>
                        )}
                        <button className='dash-btn' onClick={handleFetchExistingSession}>Buscar sesión existente</button>
                    </div>
                </article>

                <CodeSessionStats attendances={session?.attendances ?? []} />
                {session && <AttendanceList attendances={session.attendances ?? []} />}
            </Box>
        </main>
    )
}

export default CodeSessionPage