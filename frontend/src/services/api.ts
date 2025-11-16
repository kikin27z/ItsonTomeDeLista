import axios from "axios";
import type { Schedule } from "../types/academic.types";
import { API_URL } from "../config/config";


const httpClient = axios.create({
    baseURL: API_URL as string,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});


export async function GetCoursesAsocciatedTeacher(token: string, idTeacher: string) {
    return await httpClient.get<Schedule[]>(`schedules/${idTeacher}/list/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}

export async function GetScheduleById(token: string, scheduleId: string) {
    return await httpClient.get<any>(`schedules/${scheduleId}/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}

export async function CreateClassSession(token: string, scheduleId: string) {
    return await httpClient.post<any>(`class-session/${scheduleId}/new`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}

export async function GetClassSessionToday(token: string, scheduleId: string) {
    return await httpClient.get<any>(`class-session/${scheduleId}/today`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}