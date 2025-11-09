import React, { useState, type FormEvent } from 'react'
import LoginInput from './LoginInput'
import { useAuth } from '../../hooks/auth-data';
import { useNavigate } from 'react-router';




const LoginForm = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [idUser, setIdUser] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<{ idUser?: string, password?: string, wrongUser?: string }>({});

    const handleForm = (e: FormEvent) => {
        e.preventDefault();
        const newErrors: { idUser?: string, password?: string } = {};

        if (!/^0{5}\d{6}$/.test(idUser)) {
            newErrors.idUser = 'Debe ser un ID de 11 dígitos numéricos';
        }

        if (password.length < 8 || password.trim() === '') {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        login({
            username: idUser,
            password
        });
        navigate('/dashboard');
    };

    return (
        <form className='login-form' onSubmit={handleForm}>
            {errors.idUser && <span className="login-error">{errors.idUser}</span>}
            <LoginInput placeholder='Ingresar ID ITSON de 11 dígitos' nameInput='password' setValue={setIdUser} valueInput={idUser} typeInput='text' />
            {errors.password && <span className="login-error">{errors.password}</span>}
            <LoginInput placeholder='Ingresar contraseña' nameInput='password' setValue={setPassword} valueInput={password} typeInput='password' />
            <button type='submit'>Iniciar Sesión</button>
        </form>
    )
}

export default LoginForm