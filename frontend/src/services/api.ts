
export async function getAttendanceHistory(token: string, userId: string | number, options: { courseId?: number, range?: string }) {
    if (!token) throw new Error('No access token provided');

    let url = `attendance/student/${userId}`;
    const params = new URLSearchParams();

    if (options.courseId) {
        params.append('course_id', options.courseId.toString());
    } else if (options.range) {
        params.append('range_date', options.range);
    } else {
        throw new Error('Debe especificar courseId o range');
    }

    url += `?${params.toString()}`;

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

export async function ActivateClassSession(token: string, sessionId: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided')
    }
    return await httpClient.put<any>(`class-session/${sessionId}/active`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}

import axios from "axios";
import type { Schedule, Enrollment } from "../types/academic.types";
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
    const stored = token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN) : null);
    if (stored) headers['Authorization'] = `Bearer ${stored}`;
    return await httpClient.post<any>(`class-session/register`, body, { headers }).then(response => response.data);
}

export async function GetEnrollmentsStudent(token: string, username: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided');
    }
    return await httpClient.get<Enrollment[]>(`enrollments/student/${username}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}

export async function GetAttendanceHistory(token: string, scheduleId: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided');
    }
    return await httpClient.get<any>(`attendance/history/${scheduleId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => response.data);
}

export async function ExportAttendancePDF(token: string, scheduleId: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided');
    }
    return await httpClient.get(`attendance/export-pdf/${scheduleId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
    }).then(response => response.data);
}

export async function ExportAttendanceExcel(token: string, scheduleId: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided');
    }
    return await httpClient.get(`attendance/export-excel/${scheduleId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
    }).then(response => response.data);
}

export async function ExportAttendanceCSV(token: string, scheduleId: string) {
    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No access token provided');
    }
    return await httpClient.get(`attendance/export-csv/${scheduleId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
    }).then(response => response.data);
}