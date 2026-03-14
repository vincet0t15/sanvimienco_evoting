import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import type { ChangeEvent, FormEventHandler } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';
import type { Event } from '@/types/event';

type Props = {
    events: Pick<Event, 'id' | 'name'>[];
};

type VoterLoginForm = {
    event_id: string;
    username: string;
    password: string;
    remember: boolean;
};

export default function VoterLogin({ events }: Props) {
    const { data, setData, post, processing, errors } = useForm<VoterLoginForm>({
        event_id: events[0] ? String(events[0].id) : '',
        username: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/voter/login', {
            preserveScroll: true,
            onError: () => {
                const firstError = Object.values(errors)[0];

                if (firstError) {
                    toast.error(firstError);
                }
            },
        });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setData(e.target.id as keyof VoterLoginForm, e.target.value);
    };

    return (
        <AuthLayout
            title="Voter login"
            description="Select your event and login with your voter credentials"
        >
            <Head title="Voter login" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="event_id">Event</Label>
                        <Select
                            value={data.event_id}
                            onValueChange={(value) =>
                                setData('event_id', value)
                            }
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

                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            required
                            autoFocus
                            autoComplete="username"
                            placeholder="your_username"
                            value={data.username}
                            onChange={handleChange}
                        />
                        <InputError message={errors.username} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            placeholder="Password"
                            value={data.password}
                            onChange={handleChange}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) =>
                                setData('remember', checked === true)
                            }
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        disabled={processing || !data.event_id}
                    >
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Logging in...
                            </span>
                        ) : (
                            'Log in'
                        )}
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}

