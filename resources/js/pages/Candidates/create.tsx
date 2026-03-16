import { useForm } from '@inertiajs/react';
import { LoaderCircle, UploadIcon, XIcon } from 'lucide-react';
import type { ChangeEvent, SubmitEventHandler } from 'react';
import { useEffect, useRef, useState } from 'react';
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
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const photoPreviewUrlRef = useRef<string | null>(null);
    const { data, setData, post, processing, errors, reset } =
        useForm<CandidateCreateForm>({
            event_id: String(eventId || ''),
            position_id: String(positionId || ''),
            name: '',
            photo: null,
        });

    const positions = positionsByEvent[data.event_id] ?? [];

    useEffect(() => {
        return () => {
            if (photoPreviewUrlRef.current) {
                URL.revokeObjectURL(photoPreviewUrlRef.current);
                photoPreviewUrlRef.current = null;
            }
        };
    }, []);

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
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add candidate</DialogTitle>
                    <DialogDescription>
                        Create a candidate for the selected event and position.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className='flex flex-col-2 gap-2'>
                        <div>
                            <div className="space-y-2">
                                <Label htmlFor="photo">Photo</Label>
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;

                                        if (photoPreviewUrlRef.current) {
                                            URL.revokeObjectURL(photoPreviewUrlRef.current);
                                            photoPreviewUrlRef.current = null;
                                        }

                                        if (file) {
                                            const url = URL.createObjectURL(file);
                                            photoPreviewUrlRef.current = url;
                                            setPhotoPreviewUrl(url);
                                        } else {
                                            setPhotoPreviewUrl(null);
                                        }

                                        setData('photo', file);
                                    }}
                                />
                                <div className="">
                                    <button
                                        type="button"
                                        className="relative flex h-64 w-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-background"
                                        onClick={() =>
                                            document.getElementById('photo')?.click()
                                        }
                                    >
                                        {photoPreviewUrl ? (
                                            <img
                                                src={photoPreviewUrl}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                                                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                                    <UploadIcon className="size-5 text-muted-foreground" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-sm font-semibold">
                                                        Upload Photo
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Click to browse
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </button>

                                    <div className="space-y-3 mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    document
                                                        .getElementById('photo')
                                                        ?.click()
                                                }
                                            >
                                                <UploadIcon className="size-4" />
                                                {photoPreviewUrl
                                                    ? 'Change photo'
                                                    : 'Choose photo'}
                                            </Button>
                                            {photoPreviewUrl ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        if (photoPreviewUrlRef.current) {
                                                            URL.revokeObjectURL(
                                                                photoPreviewUrlRef.current,
                                                            );
                                                            photoPreviewUrlRef.current =
                                                                null;
                                                        }

                                                        setPhotoPreviewUrl(null);
                                                        setData('photo', null);
                                                    }}
                                                >
                                                    <XIcon className="size-4" />
                                                    Remove
                                                </Button>
                                            ) : null}
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            Allowed: jpeg, jpg, png, webp. Max size 2MB.
                                        </div>
                                    </div>
                                </div>
                                <InputError message={errors.photo} />
                            </div>
                        </div>
                        <div>
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
                        </div>

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
