import { Link, useNavigate } from 'react-router'
import Box from '../components/dashboard/Box'

const DashboardTeacher = () => {
    const navigate = useNavigate();
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
                    <Box extraClasses='dash-course-container'>
                        <article>
                            <h3>Programacion I</h3>
                            <p>ISW-305</p>
                        </article>
                        <article>
                            <p>📅 Lunes - Miércoles 8:00 AM - 10:00 AM</p>
                            <p>📍 Sala 201</p>
                            <p>👥 35 estudiantes</p>
                        </article>
                        <button className='dash-btn dash-btn-style1' onClick={() => navigate("/dashboard/teacher/code-session/389948")}>Iniciar Toma Asistencia</button>
                    </Box>
                    <Box extraClasses='dash-course-container'>
                        <article>
                            <h3>Programacion I</h3>
                            <p>ISW-305</p>
                        </article>
                        <article>
                            <p>📅 Lunes - Miércoles 8:00 AM - 10:00 AM</p>
                            <p>📍 Sala 201</p>
                            <p>👥 35 estudiantes</p>
                        </article>
                        <button className='dash-btn dash-btn-style1' onClick={() => navigate("/dashboard/teacher/code-session/389948")}>Iniciar Toma Asistencia</button>
                    </Box>
                    <Box extraClasses='dash-course-container'>
                        <article>
                            <h3>Programacion I</h3>
                            <p>ISW-305</p>
                        </article>
                        <article>
                            <p>📅 Lunes - Miércoles 8:00 AM - 10:00 AM</p>
                            <p>📍 Sala 201</p>
                            <p>👥 35 estudiantes</p>
                        </article>
                        <button className='dash-btn dash-btn-style1' onClick={() => navigate("/dashboard/teacher/code-session/389948")}>Iniciar Toma Asistencia</button>
                    </Box>
                    <Box extraClasses='dash-course-container'>
                        <article>
                            <h3>Programacion I</h3>
                            <p>ISW-305</p>
                        </article>
                        <article>
                            <p>📅 Lunes - Miércoles 8:00 AM - 10:00 AM</p>
                            <p>📍 Sala 201</p>
                            <p>👥 35 estudiantes</p>
                        </article>
                        <button className='dash-btn dash-btn-style1' onClick={() => navigate("/dashboard/teacher/code-session/389948")}>Iniciar Toma Asistencia</button>
                    </Box>
                
            </section>
        </main>
    )
}

export default DashboardTeacher