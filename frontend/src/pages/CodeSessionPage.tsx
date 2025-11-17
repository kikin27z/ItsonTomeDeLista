import Box from '../components/dashboard/Box'
import CodeBox from '../components/dashboard/CodeBox'
import CodeSessionStats from '../components/dashboard/CodeSessionStats'
import { useLocation, useParams } from 'react-router'
import { useEffect, useState } from 'react'
import type { Schedule } from '../types/academic.types'
import { GetScheduleById, CreateClassSession, GetClassSessionToday } from '../services/api'
import { useAuth } from '../hooks/auth-data'
import { convertTo12HourFormat } from '../utils/pipe-datetimes'

const CodeSessionPage = () => {
    const { state } = useLocation()
    const params = useParams()
    const { token } = useAuth()
    const [schedule, setSchedule] = useState<Schedule | null>(state?.schedule ?? null)
    const [loading, setLoading] = useState<boolean>(!state?.schedule)
    const [attendanceCode, setAttendanceCode] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            if (attendanceCode) return
            setLoading(true)
            try {
                let currentSchedule = schedule
                if (!currentSchedule) {
                    const id = params.id!
                    const data = await GetScheduleById(token!, id)
                    currentSchedule = data
                    setSchedule(data)
                }

                // First, try to get today's session if it exists
                try {
                    const existing = await GetClassSessionToday(token!, String(currentSchedule!.id))
                    if (existing && existing.attendance_code) {
                        setAttendanceCode(existing.attendance_code)
                        return
                    }
                } catch (getErr: any) {
                    // If GET failed, we'll try to create. If GET failed because session exists
                    // the backend might return 400 on create; we'll handle that below.
                    // Continue to creation attempt
                }

                // If no existing session, attempt to create one
                try {
                    const session = await CreateClassSession(token!, String(currentSchedule!.id))
                    if (session && session.attendance_code) {
                        setAttendanceCode(session.attendance_code)
                        return
                    }
                } catch (createErr: any) {
                    // If creation failed with 400 saying session already created, try GET again
                    if (createErr?.response?.status === 400) {
                        try {
                            const existing2 = await GetClassSessionToday(token!, String(currentSchedule!.id))
                            if (existing2 && existing2.attendance_code) {
                                setAttendanceCode(existing2.attendance_code)
                                return
                            }
                        } catch (e) {
                            console.error('Failed to get existing session after create returned 400', e)
                        }
                    }
                    console.error('Create class session failed', createErr)
                }

            } catch (err) {
                console.error('Error fetching schedule or handling session', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [schedule, token, params.id, attendanceCode])

    if (loading) return <p>Loading...</p>

    return (
        <main className='dash-main-container'>
            <Box extraClasses='dash-stats-container'>
                <article>
                    <h3>{schedule?.course?.name ?? 'Curso'}</h3>
                    <p className='dash-text-description'>{schedule ? `${schedule.days_of_week} ${convertTo12HourFormat(schedule.start_time)} - ${convertTo12HourFormat(schedule.end_time)}` : ''}</p>
                    <CodeBox code={attendanceCode ?? "Generando..."}/>
                    <p className='dash-text-description txt-c'>Los alumnos pueden ingresar el número para registrar asistencia</p>
                    <p>📍 {schedule?.classroom}</p>
                </article>

                <CodeSessionStats/>
            </Box>
        </main>
    )
}

export default CodeSessionPage