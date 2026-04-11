export interface Attendee {
    id: string;         // User ID
    email: string;
    display_name: string;
    marked_at: Date;
    status: 'confirmed' | 'pending' | 'attended' | 'no_show';
}

export interface AttendanceRecord {
    id: string;
    user_id: string;
    seminar_id: string;
    marked_at: Date;
    status: 'confirmed' | 'pending' | 'attended' | 'no_show';
}

export interface AttendanceFilter {
    status?: 'confirmed' | 'pending' | 'attended' | 'no_show';
    searchQuery?: string;
}
