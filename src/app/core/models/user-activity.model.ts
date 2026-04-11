export type UserActivityType = 'seminar_attendance' | 'comment_posted' | 'comment_replied' | 'profile_updated';

export interface UserActivity {
    id: string;
    userId: string;
    type: UserActivityType;
    targetId: string;
    timestamp: Date;
    metadata: Record<string, any>;
}
