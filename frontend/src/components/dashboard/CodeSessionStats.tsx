import React from 'react'
import { useNavigate } from 'react-router'

const CodeSessionStats = () => {
    const navigate = useNavigate();
    return (
        <article className=' flex-column'>
            <div className='dash-code-timer'>
                <p className='dash-text-description'>Código de asistencia</p>
                <h2>04:00</h2>
            </div>
            <div className='dash-grid-3c'>
                <div className='flex-column dash-stats1'>
                    <p className='dash-text-description'>Presente</p>
                    <h3>5</h3>
                </div>
                <div className='flex-column dash-stats2'>
                    <p className='dash-text-description'>Tarde</p>
                    <h3>5</h3>
                </div>
                <div className='flex-column dash-stats3'>
                    <p className='dash-text-description'>Ausente</p>
                    <h3>5</h3>
                </div>
            </div>
            <button className='dash-btn dash-btn-close-sesion' onClick={() => navigate("/dashboard/teacher/")}>Cerrar sesión de Asistencia</button>
        </article>
    )
}

export default CodeSessionStats