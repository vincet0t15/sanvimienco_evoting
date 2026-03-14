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
    const { data, setData, post, processing, errors, reset } =
        useForm<CandidateUpdateForm>({
            _method: 'put',
            position_id: String(candidate.position_id),
            name: candidate.name,
            photo: null,
        });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setData(e.target.id as keyof CandidateUpdateForm, e.target.value);
    };

    const submit: FormEventHandler = (e) => {
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit candidate</DialogTitle>
                    <DialogDescription>
                        Update the details for this candidate.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="position_id">Position</Label>
                        <Select
                            value={data.position_id}
                            onValueChange={(value) =>
                                setData('position_id', value)
                            }
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

