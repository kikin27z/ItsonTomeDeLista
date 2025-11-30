// Obtener historial de asistencias por materia o rango de fechas
// En tu archivo de servicios (ej. services/api.ts)

export async function getAttendanceHistory(token: string, userId: string | number, options: { courseId?: number, range?: string }) {
    if (!token) throw new Error('No access token provided');

    // 1. Inicia la URL con el ID del estudiante en el path
    let url = `attendance/student/${userId}`;

    // 2. Determina los parámetros a enviar (solo uno a la vez)
    const params = new URLSearchParams();

    if (options.courseId) {
        // Asumiendo que el backend espera course_id o schedule_id, pero no 'courseId'
        // NOTA: Ajusta 'course_id' al nombre exacto que espera tu backend si es diferente.
        params.append('course_id', options.courseId.toString());
    } else if (options.range) {
        // Tu backend usa 'range_date', no 'range'
        params.append('range_date', options.range);
    } else {
        // Podrías lanzar un error si no hay filtro, o simplemente no añadir parámetros.
        throw new Error('Debe especificar courseId o range');
    }

    // 3. Adjunta los parámetros a la URL
    url += `?${params.toString()}`;

    // AVISO: Debes asegurarte de que 'httpClient' sepa dónde buscar la base URL
    return await httpClient.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.data);
}
export async function CloseClassSession(token: string, sessionId: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided')
    }
    return await httpClient.put<any>(`class-session/${sessionId}/closed`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}
import axios from "axios";
import type { Schedule } from "../types/academic.types";
import { API_URL, ACCESS_TOKEN } from "../config/config";


const httpClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});


export async function GetCoursesAsocciatedTeacher(token: string, idTeacher: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided')
    }
    return await httpClient.get<Schedule[]>(`schedules/${idTeacher}/list/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}

export async function GetScheduleById(token: string, scheduleId: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided')
    }
    return await httpClient.get<any>(`schedules/${scheduleId}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}

export async function CreateClassSession(token: string, scheduleId: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided')
    }
    return await httpClient.post<any>(`class-session/${scheduleId}/new`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}

export async function GetClassSessionToday(token: string, scheduleId: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided')
    }
    return await httpClient.get<any>(`class-session/${scheduleId}/today`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}

export async function GetAttendanceFromSession(token: string, sessionId: string, status?: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided')
    }
    const params: Record<string, string> = {};
    if (status) params.status = status;
    return await httpClient.get<any>(`class-session/${sessionId}/attendances`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params
    }).then(response => response.data);
}

export async function RegisterAttendance(token: string | null, studentId: string, attendanceCode: string) {
    const body = { student_id: studentId, attendance_code: attendanceCode };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // If token not provided, try to read it from localStorage (fallback)
    const stored = token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN) : null);
    if (stored) headers['Authorization'] = `Bearer ${stored}`;
    return await httpClient.post<any>(`class-session/register`, body, { headers }).then(response => response.data);
}