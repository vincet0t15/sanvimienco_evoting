import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CalendarDays,
    CheckCircle2,
    LockKeyhole,
    ShieldCheck,
    UserRound,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';
import voter from '@/routes/voter';

type Props = {
    canRegister?: boolean;
};

export default function Welcome({ canRegister = true }: Props) {
    const { auth, name } = usePage<{
        auth: { user?: unknown };
        name?: string;
    }>().props;

    const appName = name || 'eVoting';

    return (
        <>
            <Head title="Welcome" />

            <div className="relative min-h-screen bg-background text-foreground">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />

                <header className="relative z-10 border-b">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md">
                                <AppLogo />
                            </div>
                            <div className="leading-tight">
                                <div className="text-sm font-semibold">
                                    {appName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Secure election platform
                                </div>
                            </div>
                        </Link>

                        <nav className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={voter.login.url()}>
                                    <UserRound />
                                    Voter login
                                </Link>
                            </Button>

                            {auth.user ? (
                                <Button asChild size="sm">
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={login()}>Admin login</Link>
                                    </Button>
                                    {canRegister ? (
                                        <Button asChild size="sm">
                                            <Link href={register()}>
                                                Create admin
                                            </Link>
                                        </Button>
                                    ) : null}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="relative z-10">
                    <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
                        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                    >
                                        Paperless voting
                                    </Badge>
                                    <Badge variant="secondary">
                                        Real-time tally
                                    </Badge>
                                    <Badge variant="secondary">Audit-ready</Badge>
                                </div>

                                <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                                    Run elections confidently with{' '}
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                        {appName}
                                    </span>
                                </h1>

                                <p className="text-pretty text-base text-muted-foreground md:text-lg">
                                    Create events, import voters, manage
                                    candidates and positions, then let voters
                                    cast ballots securely. Results can be
                                    revealed automatically after the election
                                    ends.
                                </p>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Button asChild size="lg">
                                        <Link href={voter.login.url()}>
                                            <LockKeyhole />
                                            Vote now
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline">
                                        <Link href={login()}>
                                            <ShieldCheck />
                                            Admin panel
                                        </Link>
                                    </Button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                                        <div className="mt-0.5 rounded-md bg-emerald-500/10 p-2 text-emerald-700 dark:text-emerald-300">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">
                                                Secure access
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Voters sign in with credentials
                                                and can vote only once.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                                        <div className="mt-0.5 rounded-md bg-blue-500/10 p-2 text-blue-700 dark:text-blue-300">
                                            <BarChart3 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">
                                                Transparent results
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Live refresh and winner
                                                highlighting after end time.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-emerald-500/15 via-sky-500/10 to-purple-500/10 blur-2xl" />
                                <Card className="overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            How it works
                                        </CardTitle>
                                        <CardDescription>
                                            Quick guide for admins and voters.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {[
                                            {
                                                title: 'Create an event',
                                                detail: 'Set the voting start/end and activate when ready.',
                                            },
                                            {
                                                title: 'Add positions & candidates',
                                                detail: 'Define what voters can vote for and who is running.',
                                            },
                                            {
                                                title: 'Import voters',
                                                detail: 'Upload a list of names and print credential slips.',
                                            },
                                            {
                                                title: 'Voting & results',
                                                detail: 'Voters cast ballots once; results show after end time.',
                                            },
                                        ].map((step, index) => (
                                            <div
                                                key={step.title}
                                                className={cn(
                                                    'flex items-start gap-3 rounded-lg border p-4',
                                                    index === 3
                                                        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/10'
                                                        : 'bg-card',
                                                )}
                                            >
                                                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                                                    {index + 1}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-semibold">
                                                        {step.title}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {step.detail}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto w-full max-w-6xl px-4 pb-14 md:px-6 md:pb-20">
                        <div className="grid gap-4 md:grid-cols-3">
                            {[
                                {
                                    icon: Users,
                                    title: 'Voter management',
                                    desc: 'Import voters fast and keep track of who already voted.',
                                },
                                {
                                    icon: CalendarDays,
                                    title: 'Event control',
                                    desc: 'Activate/deactivate events and enforce voting windows.',
                                },
                                {
                                    icon: CheckCircle2,
                                    title: 'Audit-friendly',
                                    desc: 'Review each voter’s selections (admin-only) when needed.',
                                },
                            ].map((item) => (
                                <Card key={item.title}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            {item.title}
                                        </CardTitle>
                                        <CardDescription>
                                            {item.desc}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </section>
                </main>

                <footer className="border-t">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
                        <span>
                            © {new Date().getFullYear()} {appName}
                        </span>
                        <div className="flex items-center gap-3">
                            <Link
                                href={voter.login.url()}
                                className="hover:underline"
                            >
                                Voter login
                            </Link>
                            <Link href={login()} className="hover:underline">
                                Admin login
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

