import { useAuth } from '../hooks/auth-data';
import Box from '../components/dashboard/Box';

const DashboardStudent = () => {
    const { user } = useAuth()
    return (
        <main className='dash-main-container'>
            <Box extraClasses='dash-presentation'>
                <article>
                    <span className='dash-text-description'>Matrícula</span>
                    <p className='dash-text-subtitle'>{user?.username}</p>
                </article>
                <article>
                    <span className='dash-text-description'>Carrera</span>
                    <p className='dash-text-subtitle'>{user?.major}</p>
                </article>
                <article>
                    <span className='dash-text-description'>Email</span>
                    <p className='dash-text-subtitle'>{user?.email}</p>
                </article>
            </Box>
            <Box extraClasses='dash-box-flex'>
                <h2>Registra tu Asistencia</h2>
                <p className='dash-text-description'>Ingresa el código de asistencia proporcionado por tu profesor</p>
                <div className='dash-info-bubble'>
                    <p>📌 Tu profesor generará un código único para cada clase. Ingresa este código para registrar tu asistencia.</p>
                </div>
                <form className='dash-form'>
                    <p>Código de Asistencia</p>
                    <input className='dash-input' type="text" placeholder='ej: ISW-1234567' />
                    <button className='dash-btn dash-btn-style1' >Registrar Asistencia</button>
                </form>
            </Box>

        </main>
    )
}

export default DashboardStudent