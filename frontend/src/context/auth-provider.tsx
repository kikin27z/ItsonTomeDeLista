import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";
import type { User } from "../types/user.type";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../config/config";
import { jwtDecode } from "jwt-decode";
import type { LoginType } from "../types/login.types";
import { useNavigate } from "react-router";
import { createTokens, refressAccessToken } from "../services/api-auth";

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
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const tokenRequested = localStorage.getItem(ACCESS_TOKEN);
      if (!tokenRequested) {
        setIsLoading(false);
        return;
      }

      try {
        const decodedAny = jwtDecode<any>(tokenRequested);

        // If the value stored in ACCESS_TOKEN is actually a refresh token,
        // exchange it for an access token.
        if (decodedAny?.token_type === "refresh") {
          try {
            const newAccess = await refressAccessToken({ refreshToken: tokenRequested });
            localStorage.setItem(ACCESS_TOKEN, newAccess);
            setToken(newAccess);
            const decoded = jwtDecode<User & { exp: number }>(newAccess);
            setUser({
              email: decoded.email,
              name: decoded.name,
              username: decoded.username,
              userType: decoded.userType,
              major: decoded.major,
            });
            setIsLoading(false);
            return;
          } catch (err) {
            logout();
            return;
          }
        }

        // Otherwise assume it's an access token. If expired, try to refresh using stored refresh token.
        const decoded = decodedAny as User & { exp: number };
        if (decoded.exp * 1000 < Date.now()) {
          const refreshStored = localStorage.getItem(REFRESH_TOKEN);
          if (refreshStored) {
            try {
              const newAccess = await refressAccessToken({ refreshToken: refreshStored });
              localStorage.setItem(ACCESS_TOKEN, newAccess);
              setToken(newAccess);
              const dec = jwtDecode<User & { exp: number }>(newAccess);
              setUser({
                email: dec.email,
                name: dec.name,
                username: dec.username,
                userType: dec.userType,
                major: dec.major,
              });
              setIsLoading(false);
              return;
            } catch (err) {
              logout();
              return;
            }
          }
          logout();
          return;
        }

        // Valid access token
        setToken(tokenRequested);
        setUser({
          email: decoded.email,
          name: decoded.name,
          username: decoded.username,
          userType: decoded.userType,
          major: decoded.major,
        });
      } catch (e) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    init();
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
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider