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
import type { Position } from '@/types/position';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    position: Position;
};

type PositionUpdateForm = {
    name: string;
    max_vote: string;
};

export default function PositionEditDialog({ open, setOpen, position }: Props) {
    const { data, setData, put, processing, errors, reset } =
        useForm<PositionUpdateForm>({
            name: position.name,
            max_vote: String(position.max_vote ?? 1),
        });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setData(e.target.id as keyof PositionUpdateForm, e.target.value);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/positions/${position.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Position updated successfully');
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit position</DialogTitle>
                    <DialogDescription>
                        Update the details for this position.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
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
