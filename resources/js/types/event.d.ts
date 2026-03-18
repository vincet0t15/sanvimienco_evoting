import type { Voter } from './voter';

export interface Event {
    id: number;
    name: string;
    description?: string;
    start_at: string;
    end_at: string;
    is_active: boolean;
    voters: Voter[];
}

export interface EventUpsertRequest {
    name: string;
    description?: string;
    start_at: string;
    end_at: string;
}
