import { useForm } from '@inertiajs/react';
import { LoaderCircle, UploadIcon, XIcon } from 'lucide-react';
import type { ChangeEvent, FormEventHandler, SubmitEventHandler } from 'react';
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
import type { Candidate } from '@/types/candidate';
import type { Position } from '@/types/position';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    candidate: Candidate;
    positions: Pick<Position, 'id' | 'name'>[];
};

type CandidateUpdateForm = {
    _method: 'put';
    position_id: string;
    name: string;
    photo: File | null;
};

export default function CandidateEditDialog({
    open,
    setOpen,
    candidate,
    positions,
}: Props) {
    const existingPhotoUrl = candidate.photo_url;
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(
        existingPhotoUrl,
    );
    const photoPreviewUrlRef = useRef<string | null>(null);

    const { data, setData, post, processing, errors, reset } =
        useForm<CandidateUpdateForm>({
            _method: 'put',
            position_id: String(candidate.position_id),
            name: candidate.name,
            photo: null,
        });

    useEffect(() => {
        return () => {
            if (photoPreviewUrlRef.current) {
                URL.revokeObjectURL(photoPreviewUrlRef.current);
                photoPreviewUrlRef.current = null;
            }
        };
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setData(e.target.id as keyof CandidateUpdateForm, e.target.value);
    };

    const submit: SubmitEventHandler = (e) => {
        e.preventDefault();
        post(`/candidates/${candidate.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Candidate updated successfully');
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit candidate</DialogTitle>
                    <DialogDescription>
                        Update the details for this candidate.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="flex flex-col-2 gap-2">
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
                                            URL.revokeObjectURL(
                                                photoPreviewUrlRef.current,
                                            );
                                            photoPreviewUrlRef.current = null;
                                        }

                                        if (file) {
                                            const url = URL.createObjectURL(file);
                                            photoPreviewUrlRef.current = url;
                                            setPhotoPreviewUrl(url);
                                        } else {
                                            setPhotoPreviewUrl(existingPhotoUrl);
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

                                    <div className="mt-2 space-y-3">
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
                                            {data.photo ? (
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

                                                        setPhotoPreviewUrl(
                                                            existingPhotoUrl,
                                                        );
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

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="position_id">Position</Label>
                                <Select
                                    value={data.position_id}
                                    onValueChange={(value) =>
                                        setData('position_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="position_id"
                                        className="w-full"
                                    >
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
                                    Updating...
                                </span>
                            ) : (
                                'Update'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
