import type { Event } from '@/types/event';

export interface Voter {
    id: number;
    event_id: number;
    name: string;
    username: string;
    is_active: boolean;
    event?: Pick<Event, 'id' | 'name'>;
}

