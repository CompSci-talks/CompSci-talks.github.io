// src/app/core/models/user.model.ts
export type UserRole = 'admin' | 'moderator' | 'authenticated';

export interface User {
    id: string;
    email: string;
    display_name: string;
    role: UserRole;
    photo_url?: string | null;
    email_verified: boolean;
    created_at: Date;
    last_login?: Date;
    last_active_at?: Date;
    last_active_timestamp?: Date;
    attendance_count?: number;
    attended_seminar_ids?: string[];
    preferred_topic_areas?: string[];
    enrollment_date?: Date;
}