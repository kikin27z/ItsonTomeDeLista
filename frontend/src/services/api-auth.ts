import { API_URL } from "../config/config";
import type { LoginType, TokenType } from "../types/login.types";
//Método que actualiza el access token usando el refresh token
export async function refressAccessToken({ refreshToken }: { refreshToken: string }): Promise<string> {
    const url = `${API_URL}token/refresh/`;
    const body = {
        access: refreshToken
    };
    const { access } = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Refresh token experidado, haga login de nuevo`);
        }
        return response.json();
    }).then(data => data as { access: string });

    return access;
}

// Método que verifica que el access token sea válido
export async function verifyAccessToken(token: string): Promise<boolean> {
    const url = `${API_URL}token/verify/`;
    return fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    }).then(response => {
        if (!response.ok) {
            return false;
        }
        return true;
    })
}


export async function createTokens(credentials: LoginType): Promise<TokenType> {
    const url = `${API_URL}token/`;
    return await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    }).then(data => data as TokenType);
}