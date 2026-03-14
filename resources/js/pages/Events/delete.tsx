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
import type { Event } from '@/types/event';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    event: Event;
};

export default function EventDeleteDialog({ open, setOpen, event }: Props) {
    const [confirmText, setConfirmText] = useState('');
    const requiredText = `${event.name}`;

    const deleteEvent = () => {
        router.delete(`/events/${event.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Event deleted successfully');
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Event</DialogTitle>
                    <DialogDescription>
                        To confirm deletion, type{' '}
                        <strong>{requiredText}</strong>.
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
                        onClick={deleteEvent}
                    >
                        Delete Event
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
