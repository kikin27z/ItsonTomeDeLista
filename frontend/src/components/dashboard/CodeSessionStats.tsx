import React from 'react'

type Props = {
  attendances?: Array<any>
}

const CodeSessionStats = ({ attendances = [] }: Props) => {
    const present = attendances.filter(a => a.status === 'PRESENT').length
    const absent = attendances.filter(a => a.status === 'ABSENT').length
    const late = attendances.filter(a => a.status === 'LATE').length
    const total = attendances.length

    return (
        <div className='stats-container'>
            <div className='stats-grid'>
                <div className='stat-card stat-total'>
                    <div className='stat-icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div className='stat-content'>
                        <p className='stat-label'>Total</p>
                        <h3 className='stat-value'>{total}</h3>
                    </div>
                </div>
                
                <div className='stat-card stat-present'>
                    <div className='stat-icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <div className='stat-content'>
                        <p className='stat-label'>Presente</p>
                        <h3 className='stat-value'>{present}</h3>
                    </div>
                </div>

                <div className='stat-card stat-late'>
                    <div className='stat-icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div className='stat-content'>
                        <p className='stat-label'>Tarde</p>
                        <h3 className='stat-value'>{late}</h3>
                    </div>
                </div>
                
                <div className='stat-card stat-absent'>
                    <div className='stat-icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                    </div>
                    <div className='stat-content'>
                        <p className='stat-label'>Ausente</p>
                        <h3 className='stat-value'>{absent}</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CodeSessionStats