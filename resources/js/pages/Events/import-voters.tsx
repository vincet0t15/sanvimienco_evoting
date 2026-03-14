import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import type { FormEventHandler } from 'react';
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
import type { Event } from '@/types/event';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    event: Event;
};

type ImportForm = {
    file: File | null;
};

export default function VoterImportDialog({ open, setOpen, event }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<ImportForm>(
        {
            file: null,
        },
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/events/${event.id}/voters/import`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Voters imported successfully');
                reset();
                setOpen(false);
            },
            onError: () => {
                const firstError = errors.file ?? Object.values(errors)[0];

                if (firstError) {
                    toast.error(firstError);
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import voters</DialogTitle>
                    <DialogDescription>
                        Upload an Excel/CSV file with columns: name, username,
                        password, is_active (optional).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="voters_file">File</Label>
                        <Input
                            id="voters_file"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) =>
                                setData('file', e.target.files?.[0] ?? null)
                            }
                        />
                        <InputError message={errors.file} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !data.file}>
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    Importing...
                                </span>
                            ) : (
                                'Import'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
