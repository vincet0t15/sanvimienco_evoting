export interface Candidate {
    id: number;
    event_id: number;
    position_id: number;
    name: string;
    photo_path: string | null;
    photo_url: string | null;
}
