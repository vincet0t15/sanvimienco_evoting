import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    LockKeyhole,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { home, login } from '@/routes';
import voter from '@/routes/voter';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage<{ name?: string }>().props;
    const { isCurrentUrl } = useCurrentUrl();

    const appName = name || 'eVoting';
    const isAdminLogin = isCurrentUrl(login());
    const isVoterLogin = isCurrentUrl(voter.login.url());
    const showLoginToggle = isAdminLogin || isVoterLogin;

    return (
        <div className="relative min-h-svh bg-background">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />

            <div className="relative mx-auto flex min-h-svh w-full max-w-6xl items-center px-4 py-10 md:px-6">
                <div className="grid w-full items-center gap-10 lg:grid-cols-2">
                    <div className="hidden space-y-6 lg:block">
                        <Link href={home()} className="inline-flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-card">
                                <AppLogo />
                            </div>
                            <div className="leading-tight">
                                <div className="text-base font-semibold">
                                    {appName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Secure election platform
                                </div>
                            </div>
                        </Link>

                        <div className="space-y-2">
                            <div className="text-3xl font-bold tracking-tight">
                                Vote securely, manage confidently
                            </div>
                            <div className="text-muted-foreground">
                                Admins manage events and candidates. Voters cast
                                ballots with their credentials.
                            </div>
                        </div>

                        <div className="grid gap-3">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: 'Access control',
                                    text: 'Voter accounts can be activated and limited to one vote.',
                                },
                                {
                                    icon: CalendarDays,
                                    title: 'Event window',
                                    text: 'Voting opens and closes based on event schedule.',
                                },
                                {
                                    icon: CheckCircle2,
                                    title: 'Audit view',
                                    text: 'Admins can review each voter’s selections when needed.',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="flex items-start gap-3 rounded-xl border bg-card p-4"
                                >
                                    <div className="mt-0.5 rounded-md bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="font-semibold">
                                            {item.title}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-sm">
                        <div className="mb-4 flex items-center justify-between lg:hidden">
                            <Link href={home()} className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-card">
                                    <AppLogo />
                                </div>
                                <div className="text-sm font-semibold">
                                    {appName}
                                </div>
                            </Link>
                        </div>

                        <div className="rounded-2xl border bg-card shadow-sm">
                            <div className="space-y-1 border-b p-6">
                                <h1 className="text-xl font-semibold">
                                    {title}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>

                            {showLoginToggle ? (
                                <div className="border-b p-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            asChild
                                            variant={isVoterLogin ? 'default' : 'outline'}
                                            className={cn('w-full', isVoterLogin ? '' : 'bg-transparent')}
                                        >
                                            <Link href={voter.login.url()}>
                                                <UserRound />
                                                Voter
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant={isAdminLogin ? 'default' : 'outline'}
                                            className={cn('w-full', isAdminLogin ? '' : 'bg-transparent')}
                                        >
                                            <Link href={login()}>
                                                <LockKeyhole />
                                                Admin
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : null}

                            <div className="p-6">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
