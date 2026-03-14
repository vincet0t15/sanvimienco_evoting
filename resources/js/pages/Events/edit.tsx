import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useMemo } from 'react';
import type { ChangeEvent, SubmitEventHandler } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Event, EventUpsertRequest } from '@/types/event';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    event: Event;
};

function normalizeTime(value: string): string {
    if (value === '') {
        return '';
    }

    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
        return value;
    }

    if (/^\d{2}:\d{2}$/.test(value)) {
        return `${value}:00`;
    }

    return value;
}

function splitDateTime(value: string): { date: string; time: string } {
    if (!value) {
        return { date: '', time: '' };
    }

    const [date = '', time = ''] = value.split('T');

    return { date, time: normalizeTime(time) };
}

function DateTimeInput({
    id,
    label,
    value,
    onChange,
    error,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (next: string) => void;
    error?: string;
}) {
    const parts = useMemo(() => splitDateTime(value), [value]);
    const date = parts.date;
    const time = parts.time || '10:30:00';

    const commit = (nextDate: string, nextTime: string) => {
        const normalizedTime = normalizeTime(nextTime);

        if (!nextDate) {
            onChange('');

            return;
        }

        if (!normalizedTime) {
            onChange(`${nextDate}T00:00:00`);

            return;
        }

        onChange(`${nextDate}T${normalizedTime}`);
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={`${id}_date`}>{label}</Label>
            <div className="flex gap-2">
                <Input
                    id={`${id}_date`}
                    type="date"
                    value={date}
                    onChange={(e) => {
                        const nextDate = e.target.value;

                        commit(nextDate, time);
                    }}
                />
                <Input
                    id={`${id}_time`}
                    type="time"
                    step="1"
                    value={time}
                    onChange={(e) => {
                        const nextTime = e.target.value;

                        commit(date, nextTime);
                    }}
                    className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
            </div>
            <InputError message={error} />
        </div>
    );
}

export default function EventEditDialog({ open, setOpen, event }: Props) {
    const { data, setData, put, reset, processing, errors } =
        useForm<EventUpsertRequest>({
            name: event.name,
            description: event.description || '',
            start_at: event.start_at,
            end_at: event.end_at,
        });

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setData(e.target.id as keyof EventUpsertRequest, e.target.value);
    };

    const submit: SubmitEventHandler = (e) => {
        e.preventDefault();
        put(`/events/${event.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Event updated successfully');
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit event</DialogTitle>
                    <DialogDescription>
                        Update the details for this event.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Event name"
                                value={data.name}
                                onChange={handleChange}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <DateTimeInput
                            id="start_at"
                            label="Start"
                            value={data.start_at}
                            onChange={(next) => setData('start_at', next)}
                            error={errors.start_at}
                        />

                        <DateTimeInput
                            id="end_at"
                            label="End"
                            value={data.end_at || ''}
                            onChange={(next) => setData('end_at', next)}
                            error={errors.end_at}
                        />

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Description"
                                value={data.description || ''}
                                onChange={handleChange}
                            />
                            <InputError message={errors.description} />
                        </div>

                        <Button
                            className="w-full"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </span>
                            ) : (
                                'Update Event'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
