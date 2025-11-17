import React from 'react'

type Props = {
  attendances?: Array<any>
}

const CodeSessionStats = ({ attendances = [] }: Props) => {
    const present = attendances.filter(a => a.status === 'PRESENT').length
    const absent = attendances.filter(a => a.status === 'ABSENT').length

    return (
        <article className=' flex-column'>
            <div className='dash-code-timer'>
                <p className='dash-text-description'>Código de asistencia</p>
                <h2>00:00</h2>
            </div>
            <div className='dash-grid-3c' style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className='flex-column dash-stats1'>
                    <p className='dash-text-description'>Presente</p>
                    <h3>{present}</h3>
                </div>
                <div className='flex-column dash-stats3'>
                    <p className='dash-text-description'>Ausente</p>
                    <h3>{absent}</h3>
                </div>
            </div>
        </article>
    )
}

export default CodeSessionStats