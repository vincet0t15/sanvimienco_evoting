export interface Event {
    id: number;
    name: string;
    description?: string;
    start_at: string;
    end_at: string;
    is_active: boolean;
}

export interface EventUpsertRequest {
    name: string;
    description?: string;
    start_at: string;
    end_at: string;
}
