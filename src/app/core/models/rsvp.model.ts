export interface RSVP {
    id: string;
    user_id: string;
    seminar_id: string;
    created_at: Date;
    status: 'confirmed' | 'pending';
}
