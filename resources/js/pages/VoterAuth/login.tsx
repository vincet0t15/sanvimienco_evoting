import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import type { ChangeEvent, FormEventHandler } from 'react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type VoterLoginForm = {
    username: string;
    password: string;
    remember: boolean;
};

export default function VoterLogin() {
    const { flash } = usePage<{
        flash?: {
            success?: string | null;
            error?: string | null;
        };
    }>().props;
    const flashShownRef = useRef(false);
    const { data, setData, post, processing, errors } = useForm<VoterLoginForm>({
        username: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (flashShownRef.current) {
            return;
        }

        const success = flash?.success ?? null;
        const error = flash?.error ?? null;

        if (success) {
            flashShownRef.current = true;
            toast.success(success);

            return;
        }

        if (error) {
            flashShownRef.current = true;
            toast.error(error);
        }
    }, [flash?.error, flash?.success]);

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
            description="Login with your voter credentials"
        >
            <Head title="Voter login" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
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
                        disabled={processing}
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
