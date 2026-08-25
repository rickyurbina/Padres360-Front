export interface IncidenceTeacherList {
    id:             number;
    incidence_name: string;
    teacher_name:   string;
    observation:    string;
    type:           string;
    created_at:     Date;
    read:           boolean;
    created_by_name:      string;
    student_name:   string;
    student:       number;
}

export interface IncidenceRecordsResponse {
    success: boolean;
    count: number;
    incidences: IncidenceTeacherList[];
}