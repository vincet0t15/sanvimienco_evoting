import type { Event } from '@/types/event';

export interface Voter {
    id: number;
    event_id: number;
    name: string;
    username: string;
    is_active: boolean;
    has_voted: boolean;
    last_seen_at: string | null;
    is_online: boolean;
    event?: Pick<Event, 'id' | 'name'>;
}
