import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import type { ChangeEvent, SubmitEventHandler } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Event } from '@/types/event';
import type { Position } from '@/types/position';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    events: Pick<Event, 'id' | 'name'>[];
    eventId: number;
    positionsByEvent: Record<string, Pick<Position, 'id' | 'name'>[]>;
    positionId: number;
};

type CandidateCreateForm = {
    event_id: string;
    position_id: string;
    name: string;
    photo: File | null;
};

export default function CandidateCreateDialog({
    open,
    setOpen,
    events,
    eventId,
    positionsByEvent,
    positionId,
}: Props) {
    const { data, setData, post, processing, errors, reset } =
        useForm<CandidateCreateForm>({
            event_id: String(eventId || ''),
            position_id: String(positionId || ''),
            name: '',
            photo: null,
        });

    const positions = positionsByEvent[data.event_id] ?? [];

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setData(e.target.id as keyof CandidateCreateForm, e.target.value);
    };

    const submit: SubmitEventHandler = (e) => {
        e.preventDefault();
        post('/candidates', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Candidate added successfully');
                reset();
                setOpen(false);
            },
            onError: () => {
                const firstError = Object.values(errors)[0];

                if (firstError) {
                    toast.error(firstError);
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent className="min-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add candidate</DialogTitle>
                    <DialogDescription>
                        Create a candidate for the selected event and position.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="event_id">Event</Label>
                        <Select
                            value={data.event_id}
                            onValueChange={(value) => {
                                setData('event_id', value);

                                const firstPosition = positionsByEvent[value]?.[0];
                                setData(
                                    'position_id',
                                    firstPosition ? String(firstPosition.id) : '',
                                );
                            }}
                        >
                            <SelectTrigger id="event_id" className="w-full">
                                <SelectValue placeholder="Select event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events.map((event) => (
                                    <SelectItem
                                        key={event.id}
                                        value={String(event.id)}
                                    >
                                        {event.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.event_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="position_id">Position</Label>
                        <Select
                            value={data.position_id}
                            onValueChange={(value) =>
                                setData('position_id', value)
                            }
                            disabled={positions.length === 0}
                        >
                            <SelectTrigger id="position_id" className="w-full">
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                {positions.map((position) => (
                                    <SelectItem
                                        key={position.id}
                                        value={String(position.id)}
                                    >
                                        {position.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.position_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Candidate name"
                            value={data.name}
                            onChange={handleChange}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="photo">Photo</Label>
                        <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData(
                                    'photo',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                        <InputError message={errors.photo} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
