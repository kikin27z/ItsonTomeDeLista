import axios from "axios";
import type { Schedule } from "../types/academic.types";
import { API_URL, ACCESS_TOKEN } from "../config/config";


const httpClient = axios.create({
    baseURL: API_URL as string,
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

export async function RegisterAttendance(token: string | null, studentId: string, attendanceCode: string) {
    const body = { student_id: studentId, attendance_code: attendanceCode };
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    // If token not provided, try to read it from localStorage (fallback)
    const stored = token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN) : null);
    if (stored) headers['Authorization'] = `Bearer ${stored}`;
    return await httpClient.post<any>(`class-session/register`, body, { headers }).then(response => response.data);
}