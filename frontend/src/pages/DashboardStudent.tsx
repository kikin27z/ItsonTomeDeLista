import { useAuth } from '../hooks/auth-data';
import Box from '../components/dashboard/Box';
import { useState } from 'react';
import { RegisterAttendance } from '../services/api';

const DashboardStudent = () => {
    const { user, token } = useAuth()
    const [code, setCode] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setError(null)

        const trimmed = code.trim()
        if (!trimmed) {
            setError('Ingrese un código de asistencia válido')
            return
        }

        if (!user?.username) {
            setError('Usuario no identificado')
            return
        }

        try {
            setLoading(true)
            const res = await RegisterAttendance(token ?? null, user.username, trimmed)
            // Backend may return success message or object; adapt accordingly
            if (res && (res.success || res.id || res.attendance_code)) {
                setMessage('Asistencia registrada correctamente')
            } else if (res && res.error) {
                setError(res.error)
            } else {
                setMessage('Asistencia registrada correctamente')
            }
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || 'Error al registrar asistencia'
            setError(String(msg))
        } finally {
            setLoading(false)
        }
    }

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
                {message ? (
                    <div className='dash-large-output' style={{ textAlign: 'center', padding: 40 }}>
                        <h1 style={{ margin: 0 }}>{message}</h1>
                    </div>
                ) : (
                    <form className='dash-form' onSubmit={handleSubmit}>
                        <p>Código de Asistencia</p>
                        <input
                            className='dash-input'
                            type="text"
                            placeholder='ej: ISW-1234567'
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            disabled={loading}
                        />
                        <button className='dash-btn dash-btn-style1' disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrar Asistencia'}
                        </button>
                        {error && <p className='dash-error'>{error}</p>}
                    </form>
                )}
            </Box>

        </main>
    )
}

export default DashboardStudent