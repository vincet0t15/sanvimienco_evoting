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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EventUpsertRequest } from '@/types/event';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

export default function EventCreateDialog({ open, setOpen }: Props) {
    const { data, setData, post, reset, processing, errors } =
        useForm<EventUpsertRequest>({
            title: '',
            location: '',
            description: '',
            start_at: '',
            end_at: '',
        });

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setData(e.target.id as keyof EventUpsertRequest, e.target.value);
    };

    const submit: SubmitEventHandler = (e) => {
        e.preventDefault();
        post('/events', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Event created successfully');
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create event</DialogTitle>
                    <DialogDescription>
                        Add the details for the new event.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Event title"
                                value={data.title}
                                onChange={handleChange}
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="Event location"
                                value={data.location || ''}
                                onChange={handleChange}
                            />
                            <InputError message={errors.location} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="start_at">Start</Label>
                            <Input
                                id="start_at"
                                type="datetime-local"
                                value={data.start_at}
                                onChange={handleChange}
                            />
                            <InputError message={errors.start_at} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_at">End</Label>
                            <Input
                                id="end_at"
                                type="datetime-local"
                                value={data.end_at || ''}
                                onChange={handleChange}
                            />
                            <InputError message={errors.end_at} />
                        </div>

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
                                    Creating...
                                </span>
                            ) : (
                                'Create Event'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
