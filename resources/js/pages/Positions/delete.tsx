import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
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

export default function PositionDeleteDialog({ open, setOpen, position }: Props) {
    const [confirmText, setConfirmText] = useState('');
    const requiredText = `${position.name}`;

    const deletePosition = () => {
        router.delete(`/positions/${position.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Position deleted successfully');
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete position</DialogTitle>
                    <DialogDescription>
                        To confirm deletion, type <strong>{requiredText}</strong>
                        .
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm</Label>
                    <Input
                        id="confirm"
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={requiredText}
                        value={confirmText}
                    />
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={confirmText !== requiredText}
                        variant="destructive"
                        onClick={deletePosition}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

