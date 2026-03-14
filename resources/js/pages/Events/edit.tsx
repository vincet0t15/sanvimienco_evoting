import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ChevronDownIcon, LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ChangeEvent, SubmitEventHandler } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

    const trimmed = value.trim();

    let date = '';
    let time = '';

    if (trimmed.includes('T')) {
        [date = '', time = ''] = trimmed.split('T');
    } else if (trimmed.includes(' ')) {
        [date = '', time = ''] = trimmed.split(' ');
    } else {
        date = trimmed;
    }

    time = time.replace(/Z$/, '');
    time = time.replace(/([+-]\d{2}:?\d{2})$/, '');
    time = time.replace(/\.\d+$/, '');

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
    const [open, setOpen] = useState(false);

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

    const selectedDate = date ? new Date(`${date}T00:00:00`) : undefined;

    return (
        <div className="space-y-2">
            <Label htmlFor={`${id}_date`}>{label}</Label>
            <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id={`${id}_date`}
                            variant="outline"
                            type="button"
                            className="w-60 justify-between font-normal"
                        >
                            {selectedDate
                                ? format(selectedDate, 'PPP')
                                : 'Select date'}
                            <ChevronDownIcon className="ml-2 size-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            captionLayout="dropdown"
                            defaultMonth={selectedDate}
                            onSelect={(next) => {
                                if (!next) {
                                    onChange('');

                                    return;
                                }

                                commit(format(next, 'yyyy-MM-dd'), time);
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
                <Input
                    id={`${id}_time`}
                    type="time"
                    step="1"
                    value={time}
                    onChange={(e) => {
                        const nextTime = e.target.value;

                        if (!date) {
                            return;
                        }

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
