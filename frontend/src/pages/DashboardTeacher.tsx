import {  useNavigate } from 'react-router'
import Box from '../components/dashboard/Box'
import { useEffect, useState } from 'react';
import type { Schedule } from '../types/academic.types';
import { GetCoursesAsocciatedTeacher } from '../services/api';
import { useAuth } from '../hooks/auth-data';
import { convertTo12HourFormat } from '../utils/pipe-datetimes';

const DashboardTeacher = () => {
    const { user, token } = useAuth();
    const [schedules, setSchedule] = useState<Schedule[]>([]);
    const navigate = useNavigate();


    useEffect(() => {
        const retrieveSchedules = async () => {
            const data = await GetCoursesAsocciatedTeacher(token!, user!.username);
            setSchedule(data);
        }
        retrieveSchedules();
    }, []);

    return (
        <main className='dash-main-container'>
            <Box extraClasses='dash-presentation'>
                <article>
                    <span className='dash-text-description'>Clases a tu cargo</span>
                    <p className='dash-text-subtitle'>3</p>
                </article>
                <article>
                    <span className='dash-text-description'>Total de alumnos</span>
                    <p className='dash-text-subtitle'>83</p>
                </article>
                <article>
                    <span className='dash-text-description'>Sesión activa</span>
                    <p className='dash-text-subtitle'>4</p>
                </article>
            </Box>
            <Box extraClasses='dash-box-padding'>
                <p>Selecciona una clase</p>
                <p className='dash-text-description'>Elige la clase para la cual deseas tomar asistencia</p>
            </Box>
            <section className='dash-grid-3c'>

                {schedules.map(s => (
                    <Box key={s.id} extraClasses='dash-course-container'>
                        <article>
                            <h3>{s.course.name}</h3>
                            <p>{s.course.key_name}</p>
                        </article>
                        <article>
                            <p>{`📅 ${s.days_of_week} ${convertTo12HourFormat(s.start_time)} - ${convertTo12HourFormat(s.end_time)}`}</p>
                            <p>📍 {s.classroom}</p>
                            <p>👥 35 estudiantes</p>
                        </article>
                        <button className='dash-btn dash-btn-style1' onClick={() => navigate(`/dashboard/teacher/code-session/${s.id}`)}>Iniciar Toma Asistencia</button>
                    </Box>
                ))}
            </section>
        </main>
    )
}

export default DashboardTeacher