type CodeBoxProps = {
  code: string;
};

const CodeBox = ({code}: CodeBoxProps) => {
    return (
        <article className='dash-stats-code flex-column'>
            <h2>{code}</h2>
            <p className='dash-text-description'>Código de asistencia</p>
        </article>
    )
}

export default CodeBox