import '../../styles/loading.css';

const Loading = ({message}: {message:string}) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="spinner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  )
}

export default Loading