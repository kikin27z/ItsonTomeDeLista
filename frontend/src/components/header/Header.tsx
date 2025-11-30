import { useAuth } from "../../hooks/auth-data"
import { useNavigate } from "react-router"

const Header = () => {
  const {user, logout} = useAuth(); 
  const navigate = useNavigate();
  return (
    <header className="dash-header">
      <section className="dash-header-info">
        <h1>{user?.userType === "STUDENT" ? "Panel del estudiante" : "Panel del Profesor"}</h1>
        <h4>{`Bievenido, ${user?.name}`}</h4>
      </section>
      <nav className="dash-header-options">
        <button className="dash-logout" onClick={() => logout()}>Cerrar sesión</button>
      </nav>
    </header>
  )
}

export default Header