type CodeBoxProps = {
  code: string;
};

const CodeBox = ({code}: CodeBoxProps) => {
    return (
        <div className='code-box-container'>
            <div className='code-box-header'>
                <div className='code-box-icon'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <div className='code-box-title-section'>
                    <h3 className='code-box-title'>Código de Asistencia</h3>
                    <p className='code-box-subtitle'>Comparte este código con tus estudiantes</p>
                </div>
            </div>
            
            <div className='code-display'>
                <div className='code-value'>{code}</div>
                <div className='code-decorative-line'></div>
            </div>

            <div className='code-box-footer'>
                <div className='code-info-badge'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Válido durante la sesión</span>
                </div>
            </div>
        </div>
    )
}

export default CodeBox