export interface Course {
    id: number;
    name: string;
    // El backend devuelve credits como string; mantenemos compatibilidad flexible
    credits: string | number;
    // Puede venir como 'department' o mal escrito 'deparment'; ambas opcionales
    department?: string;
    deparment?: string; // tolerancia a posible typo en backend
    key_name: string;
}

export interface Schedule {
    id: number;
    course: Course;
    start_time: string;
    end_time: string;    
    start_date: string;
    end_date: string;
    classroom: string;
    days_of_week: string;
}

// Representa la inscripción de un estudiante a un curso (enrollment)
export interface Enrollment {
    id: number;
    course: Course;
    start_time: string;
    end_time: string;
    start_date: string;
    end_date: string;
    classroom: string;
    days_of_week: string;
}