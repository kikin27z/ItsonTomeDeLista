import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";
import type { User } from "../types/user.type";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../config/config";
import { jwtDecode } from "jwt-decode";
import type { LoginType } from "../types/login.types";
import { useNavigate } from "react-router";
import { createTokens } from "../services/api-auth";

interface Props {
  children: ReactNode;
}
const AuthProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    setToken(null);
    setUser(null);
    navigate("/");
  };

  const login = async (credentials: LoginType) => {
    try {
      setIsLoading(true);
      const tokenCreated = await createTokens(credentials);

      localStorage.setItem(ACCESS_TOKEN, tokenCreated.access);
      if (tokenCreated.refresh) {
        localStorage.setItem(REFRESH_TOKEN, tokenCreated.refresh);
      }
      setToken(tokenCreated.access);
      const decoded = jwtDecode<User>(tokenCreated.access);
      setUser({
        email: decoded.email,
        name: decoded.name,
        username: decoded.username,
        userType: decoded.userType,
        major: decoded.major,
      });
    } catch (error) {// Propagar el error a un componente por si acaso falla crear un jwt
      throw error;
    }finally{
      setIsLoading(false);
    }
  };

  //Verifica si el usuario esta guardado en el localstorage y si es el caso lo loguea
  useEffect(() => {
    setIsLoading(true);
    const tokenRequested = localStorage.getItem(ACCESS_TOKEN);
    if (tokenRequested) {
      try {

        const decoded = jwtDecode<User & { exp: number }>(tokenRequested);
        //Si la sesión expiro se dirige al logout
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setToken(tokenRequested);
          setUser({
            email: decoded.email,
            name: decoded.name,
            username: decoded.username,
            userType: decoded.userType,
            major: decoded.major,
          });
        }
      } catch (error) {
        console.log("Token inválido");
        logout();
      }
      setIsLoading(false);
    }
  }, []);

  // Verifica cada 60 segundos si el token sigue siendo válido
  useEffect(() => {
    const verifyTokenTimer = setInterval(() => {
      const tokenRequested = localStorage.getItem(ACCESS_TOKEN);

      if (!tokenRequested) return;
      try {
        const decoded = jwtDecode<{ exp: number }>(tokenRequested);
        //Si la sesión expiro se dirige al logout
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        }
      } catch (error) {
        console.log("Token inválido");
        logout();
      }
    }, 60000);

    return () => clearInterval(verifyTokenTimer);
  }, [])



  const values = {
    login: login,
    logout: logout,
    user: user,
    token: token,
    isLoading: isLoading,
  }
  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider