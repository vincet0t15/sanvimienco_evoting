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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Event } from '@/types/event';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    events: Pick<Event, 'id' | 'name'>[];
};

type ImportForm = {
    event_id: string;
    file: File | null;
};

export default function VoterImportDialog({ open, setOpen, events }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<ImportForm>(
        {
            event_id: '',
            file: null,
        },
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.event_id) {
            toast.error('Please select an event.');

            return;
        }

        post(`/events/${data.event_id}/voters/import`, {
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
                        Upload an Excel/CSV file with 1 column (Name). Username
                        and Password will be auto-generated (6 characters) from
                        the name.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="voters_event">Event</Label>
                        <Select
                            value={data.event_id}
                            onValueChange={(value) => setData('event_id', value)}
                        >
                            <SelectTrigger id="voters_event" className="w-full">
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
                        <Button
                            type="submit"
                            disabled={processing || !data.file || !data.event_id}
                        >
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
