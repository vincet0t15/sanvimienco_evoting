import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import type { ChangeEvent, FormEventHandler } from 'react';
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

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    events: Pick<Event, 'id' | 'name'>[];
    eventId: number;
};

type PositionCreateForm = {
    event_id: string;
    name: string;
    max_vote: string;
};

export default function PositionCreateDialog({
    open,
    setOpen,
    events,
    eventId,
}: Props) {
    const { data, setData, post, processing, errors, reset } =
        useForm<PositionCreateForm>({
            event_id: String(eventId || ''),
            name: '',
            max_vote: '1',
        });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setData(e.target.id as keyof PositionCreateForm, e.target.value);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/positions', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Position added successfully');
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add position</DialogTitle>
                    <DialogDescription>Create a position.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="event_id">Event</Label>
                        <Select
                            value={data.event_id}
                            onValueChange={(value) => setData('event_id', value)}
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
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Position name"
                            value={data.name}
                            onChange={handleChange}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max_vote">Max vote</Label>
                        <Input
                            id="max_vote"
                            type="number"
                            min={1}
                            placeholder="1"
                            value={data.max_vote}
                            onChange={handleChange}
                        />
                        <InputError message={errors.max_vote} />
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
