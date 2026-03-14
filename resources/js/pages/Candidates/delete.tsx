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
import type { Candidate } from '@/types/candidate';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    candidate: Candidate;
};

export default function CandidateDeleteDialog({
    open,
    setOpen,
    candidate,
}: Props) {
    const [confirmText, setConfirmText] = useState('');
    const requiredText = `${candidate.name}`;

    const deleteCandidate = () => {
        router.delete(`/candidates/${candidate.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Candidate deleted successfully');
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete candidate</DialogTitle>
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
                        onClick={deleteCandidate}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

