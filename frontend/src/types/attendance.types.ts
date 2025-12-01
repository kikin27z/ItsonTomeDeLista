interface ClassSession{
    
}

export interface AttendanceHistoryRecord {
    student__unique_id: string;
    complete_name: string;
    class_session__actual_start_time: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED';
}

export interface AttendanceHistoryResponse {
    headers: string[];
    records: AttendanceHistoryRecord[];
}