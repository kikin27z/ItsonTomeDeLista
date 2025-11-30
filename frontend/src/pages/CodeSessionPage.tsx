import Box from '../components/dashboard/Box'
import CodeBox from '../components/dashboard/CodeBox'
import { useLocation, useParams, Link } from 'react-router'
import { useEffect, useState } from 'react'
import type { Schedule } from '../types/academic.types'
import { GetScheduleById, CreateClassSession, GetClassSessionToday, CloseClassSession } from '../services/api'
import * as Api from '../services/api'
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
    interface ClassSessionState {
        id: number
        status: 'ACTIVE' | 'CLOSED'
        attendance_code?: string | null
        attendances?: any[]
    }
    const [session, setSession] = useState<ClassSessionState | null>(null)

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
                    try {
                        const existing = await GetClassSessionToday(token, String(data.id))
                        if (existing) {
                            if (existing.attendance_code) setAttendanceCode(existing.attendance_code)
                            setSession(existing)
                        }
                    } catch (e) {
                        // If 400/403/401 occurs it will be logged by caller; ignore here
                        console.error('Error fetching today session on load', e)
                    }
                }
                else {
                    // If schedule already present (from navigation state), try fetch existing session once
                    if (!session) {
                        try {
                            const existing = await GetClassSessionToday(token, String(schedule.id))
                            if (existing) {
                                if (existing.attendance_code) setAttendanceCode(existing.attendance_code)
                                setSession(existing)
                            }
                        } catch (e) {
                            console.error('Error fetching today session on load', e)
                        }
                    }
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

    const handleCloseSession = async () => {
        if (!token || !session || !session.id) return;
        setLoading(true);
        try {
            await CloseClassSession(token, String(session.id));
            // Mantener attendances ya cargadas, sólo mutar estado / code
            setSession((prev) => prev ? { ...prev, status: 'CLOSED', attendance_code: null } : null);
            setAttendanceCode(null);
        } catch (err) {
            console.error('Error closing class session', err);
        } finally {
            setLoading(false);
        }
    }
    
    // Polling: when a session is active, fetch attendances immediately and every 5 seconds
    useEffect(() => {
        // Sólo hacer polling si la sesión está activa
        if (!session || !session.id || !token || session.status !== 'ACTIVE') return
        let mounted = true
        let intervalId: number | null = null

        const fetchNow = async () => {
            try {
                const data = await Api.GetAttendanceFromSession(token, String(session.id))
                if (!mounted) return
                setSession((prev: any) => ({ ...(prev ?? {}), attendances: data }))
            } catch (err) {
                console.error('Polling: failed to fetch attendances', err)
            }
        }

        // initial immediate fetch
        fetchNow()

        // start interval
        intervalId = window.setInterval(fetchNow, 5000)

        return () => {
            mounted = false
            if (intervalId) clearInterval(intervalId)
        }
    }, [session?.id, session?.status, token])
    

    if (loading) return <p>Loading...</p>

    return (
        <main className='dash-main-container'>
            <Box extraClasses='dash-stats-container'>
                <article>
                    <div className='course-header-section'>
                        <div className='course-info'>
                            <h3>{schedule?.course?.name ?? 'Curso'}</h3>
                            <p className='dash-text-description'>{schedule ? `${schedule.days_of_week} ${convertTo12HourFormat(schedule.start_time)} - ${convertTo12HourFormat(schedule.end_time)}` : ''}, {schedule?.classroom} </p>
                        </div>
                        <Link to="/dashboard/teacher/session-history" className='history-link-btn'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                <path d="M21 3v5h-5"/>
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                <path d="M8 16H3v5"/>
                            </svg>
                            Historial de asistencia
                        </Link>
                    </div>
                    {session?.status === 'ACTIVE' && attendanceCode ? (
                        <>
                            <CodeBox code={attendanceCode} />
                            <p className='dash-text-description txt-c'>Los alumnos pueden ingresar el número para registrar asistencia</p>
                        </>
                    ) : session && session.status === 'CLOSED' ? (
                        <p className='dash-text-description txt-c'>La sesión de asistencia de hoy ya fue cerrada.</p>
                    ) : (
                        <p className='dash-text-description txt-c'>No hay sesión de asistencia abierta. Presiona el botón para abrir una.</p>
                    )}

                    <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                        {session ? (
                            session.status === 'ACTIVE' ? (
                                <button className='dash-btn dash-btn-close-sesion' onClick={handleCloseSession}>Cerrar sesión de Asistencia</button>
                            ) : (
                                // Sesión cerrada: deshabilitar completamente abrir
                                <button className='dash-btn dash-btn-style1' disabled title='La sesión de hoy ya está cerrada'>Sesión cerrada</button>
                            )
                        ) : (
                            <button
                                className='dash-btn dash-btn-style1'
                                onClick={handleOpenSession}
                                disabled={loading}
                                title={loading ? 'Procesando...' : 'Abrir sesión de Asistencia'}
                            >Abrir sesión de Asistencia</button>
                        )}
                    </div>
                </article>

                {session && <AttendanceList attendances={session.attendances ?? []} />}
            </Box>
            
        </main>
    )
}

export default CodeSessionPage