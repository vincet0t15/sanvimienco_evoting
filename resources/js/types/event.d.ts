export interface Event {
    id: number;
    name: string;
    description?: string;
    start_at: string;
    end_at: string;
}

export interface EventCreateRequest {
    name: string;
    description?: string;
    start_at: string;
    end_at: string;
}