import '../styles/login.css';
import LoginForm from '../components/login/LoginForm';
import { useAuth } from '../hooks/auth-data';

const LoginPage = () => {
  const {user} = useAuth();

  

  return (
    <main className='login-container'>
      <section className='login-form-container'>
        <article className='login-img-container'>
          <img className='login-itson-logo' src="src/assets/logo-itson.png" alt="Logo itson" />
          <img className='login-caa-logo' src="src/assets/caa.png" alt="Logo CAA" />
        </article>

        <LoginForm/>
        <p className='login-footer'>Aviso Privacidad</p>
      </section>
    </main>
  )
}

export default LoginPage