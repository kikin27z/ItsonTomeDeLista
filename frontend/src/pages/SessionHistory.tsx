import Box from '../components/dashboard/Box'

const SessionHistory = () => {
  return (
    <main className='dash-main-container'>
      <Box extraClasses='dash-stats-container'>
        <article>
          <h3>Historial de sesiones</h3>
          <p className='dash-text-description'>Aquí podrás consultar el historial de asistencias de varios días.</p>
        </article>
      </Box>
    </main>
  )
}

export default SessionHistory
