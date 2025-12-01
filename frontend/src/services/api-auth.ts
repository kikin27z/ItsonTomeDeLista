import axios from "axios";
import { API_URL } from "../config/config";
import type { LoginType, TokenType } from "../types/login.types";

const httpClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

export async function refressAccessToken({ refreshToken }: { refreshToken: string }) {
    const body = { refresh: refreshToken };
    try {
        const response = await httpClient.post<{ access: string }>("token/refresh/", body);
        return response.data.access;
    } catch (error: any) {
        throw new Error('Refresh token expirado, haga login de nuevo');
    }
}

export async function verifyAccessToken(token: string): Promise<boolean> {
    try {
        const response = await httpClient.post("token/verify/", { token });
        return response.status === 200;
    } catch (error: any) {
        throw new Error('Error al verificar la validez del token');
    }
}

export async function createTokens(credentials: LoginType): Promise<TokenType> {
    try {
        const response = await httpClient.post<TokenType>("token/", credentials);
        return response.data;
    } catch (error: any) {
        throw error;
    }
}