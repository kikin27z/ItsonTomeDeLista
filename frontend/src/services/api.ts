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
    console.log('Juan Cirerol')
    return await httpClient.get<Schedule[]>(`schedules/${idTeacher}/list/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}