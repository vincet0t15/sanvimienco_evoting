import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import type { ChangeEvent, FormEventHandler } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

type VoterCreateForm = {
    event_id: string;
    name: string;
    username: string;
    password: string;
    is_active: boolean;
};

export default function VoterCreateDialog({ open, setOpen, events }: Props) {
    const { data, setData, post, processing, errors, reset } =
        useForm<VoterCreateForm>({
            event_id: '',
            name: '',
            username: '',
            password: '',
            is_active: true,
        });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setData(e.target.id as keyof VoterCreateForm, e.target.value);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/voters', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Voter added successfully');
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add voter</DialogTitle>
                    <DialogDescription>
                        Create a voter account for a selected event.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="event_id">Event</Label>
                        <Select
                            value={data.event_id}
                            onValueChange={(value) => setData('event_id', value)}
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
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="Full name"
                            value={data.name}
                            onChange={handleChange}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            placeholder="Username"
                            value={data.username}
                            onChange={handleChange}
                        />
                        <InputError message={errors.username} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={data.password}
                            onChange={handleChange}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked === true)
                            }
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>
                    <InputError message={errors.is_active} />

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
