export interface Course {
    id: number;
    name: string;
    credits: string | number;
    department?: string;
    deparment?: string; 
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