import { createContext } from "react";
import type { User } from "../types/user.type";
import type { LoginType } from "../types/login.types";

export interface AuthContextType{
    user: User | null;
    token: string | null;
    login: (credentials: LoginType) => void;
    logout: () => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);