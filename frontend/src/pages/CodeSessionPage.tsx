import Box from '../components/dashboard/Box'
import CodeBox from '../components/dashboard/CodeBox'
import CodeSessionStats from '../components/dashboard/CodeSessionStats'

const CodeSessionPage = () => {
    return (
        <main className='dash-main-container'>
            <Box extraClasses='dash-stats-container'>
                <article>
                    <h3>Programación I</h3>
                    <p className='dash-text-description'>Lunes - Miércoles 8:00 AM - 10:00 AM</p>
                    <CodeBox/>
                    <p className='dash-text-description txt-c'>Los alumnos pueden ingresar el número para registrar asistencia</p>
                </article>

                <CodeSessionStats/>
            </Box>
        </main>
    )
}

export default CodeSessionPage