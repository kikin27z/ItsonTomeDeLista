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
            if (!token || !user) return
            try {
                const data = await GetCoursesAsocciatedTeacher(token, user.username);
                setSchedule(data);
            } catch (err) {
                console.error('Failed to retrieve schedules', err);
            }
        }
        retrieveSchedules();
    }, [token, user]);

    return (
        <main className='dash-main-container'>

            {/* Classes Section */}
            <Box extraClasses='classes-section'>
                <div className='section-header'>
                    <div>
                        <h2 className='section-title'>Mis Clases</h2>
                        <p className='section-description'>Selecciona una clase para gestionar la asistencia</p>
                    </div>
                </div>

                {schedules.length === 0 ? (
                    <div className='empty-classes-state'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                        <p className='empty-state-title'>No hay clases asignadas</p>
                    </div>
                ) : (
                    <div className='courses-grid'>
                        {schedules.map(s => (
                            <div key={s.id} className='course-card'>
                                <div className='course-card-header'>
                                    <div className='course-icon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                        </svg>
                                    </div>
                                    <div className='course-title-section'>
                                        <h3 className='course-name'>{s.course.name}</h3>
                                        <span className='course-key'>{s.course.key_name}</span>
                                    </div>
                                </div>

                                <div className='course-details'>
                                    <div className='course-detail-item'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        <span>{s.days_of_week}</span>
                                    </div>

                                    <div className='course-detail-item'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                        <span>{convertTo12HourFormat(s.start_time)} - {convertTo12HourFormat(s.end_time)}</span>
                                    </div>

                                    <div className='course-detail-item'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                            <circle cx="12" cy="10" r="3"/>
                                        </svg>
                                        <span>{s.classroom}</span>
                                    </div>
                                </div>

                                <button 
                                    className='course-action-btn' 
                                    onClick={() => navigate(`/dashboard/teacher/code-session/${s.id}`, { state: { schedule: s } })}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 11l3 3L22 4"/>
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                    </svg>
                                    Tomar Asistencia
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Box>
        </main>
    )
}

export default DashboardTeacher