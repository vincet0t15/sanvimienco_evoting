import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarDays,
    LayoutGrid,
    ListOrdered,
    UserRound,
    Users,
    Vote,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import candidates from '@/routes/candidates';
import events from '@/routes/events';
import positions from '@/routes/positions';
import results from '@/routes/results';
import voters from '@/routes/voters';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

type ActiveEvent = {
    id: number;
    name: string;
    description: string | null;
    start_at: string;
    end_at: string;
    is_active: boolean;
};

type VoteActivityLog = {
    id: number;
    voter: {
        id: number;
        name: string;
        username: string;
    };
    created_at: string | null;
};

type Props = {
    stats: {
        total_voters: number;
        total_candidates: number;
        total_positions: number;
        active_event: ActiveEvent | null;
        votes_cast: number;
        turnout_percentage: number;
    };
    recentActivity: VoteActivityLog[];
};

function ProgressBar({ value }: { value: number }) {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;

    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
                className="h-full bg-emerald-600 transition-[width] dark:bg-emerald-500"
                style={{ width: `${safeValue}%` }}
            />
        </div>
    );
}

function initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        return 'U';
    }

    const first = words[0]?.[0] ?? 'U';
    const second = words.length > 1 ? words[1]?.[0] ?? '' : (words[0]?.[1] ?? '');

    return (first + second).toUpperCase();
}

export default function Dashboard({ stats, recentActivity }: Props) {
    const activeEvent = stats.active_event;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="w-full">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Election Status
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                    </div>

                    {activeEvent ? (
                        <Card className="relative overflow-hidden border-emerald-500/50 bg-emerald-50/50 shadow-sm dark:bg-emerald-950/10">
                            <div className="absolute right-0 top-0 p-4 opacity-10">
                                <Vote className="h-28 w-28 text-emerald-600" />
                            </div>
                            <CardHeader className="relative z-10 pb-2">
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-3xl font-bold text-emerald-800 dark:text-emerald-400">
                                                {activeEvent.name}
                                            </CardTitle>
                                            <Badge className="animate-pulse border-none bg-emerald-600 text-white shadow-sm hover:bg-emerald-700">
                                                Active Now
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-base text-emerald-700/80 dark:text-emerald-400/80">
                                            {activeEvent.description ||
                                                'No description provided.'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={results.index.url()}>
                                            <Button
                                                variant="outline"
                                                className="shadow-md transition-all hover:scale-105"
                                            >
                                                View results
                                            </Button>
                                        </Link>
                                        <Link href={events.index.url()}>
                                            <Button className="bg-emerald-600 text-white shadow-md transition-all hover:scale-105 hover:bg-emerald-700">
                                                Manage event
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="flex flex-col space-y-1 rounded-lg border border-emerald-100 bg-white/50 p-3 backdrop-blur-sm dark:border-emerald-900/50 dark:bg-black/20">
                                        <span className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                            Start Date
                                        </span>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                            <CalendarDays className="h-4 w-4" />
                                            <span>
                                                {new Date(
                                                    activeEvent.start_at,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-1 rounded-lg border border-emerald-100 bg-white/50 p-3 backdrop-blur-sm dark:border-emerald-900/50 dark:bg-black/20">
                                        <span className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                            End Date
                                        </span>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                            <CalendarDays className="h-4 w-4" />
                                            <span>
                                                {new Date(
                                                    activeEvent.end_at,
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-1 rounded-lg border border-emerald-100 bg-white/50 p-3 backdrop-blur-sm dark:border-emerald-900/50 dark:bg-black/20">
                                        <span className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                            Current Turnout
                                        </span>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                            <Vote className="h-4 w-4" />
                                            <span>
                                                {stats.votes_cast} Votes (
                                                {stats.turnout_percentage}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-2 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 rounded-full bg-muted/50 p-4">
                                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold">
                                    No Active Election
                                </h3>
                                <p className="mt-2 mb-6 max-w-md text-sm text-muted-foreground">
                                    There is no election currently active. Open
                                    Events and toggle one event to active to
                                    start tracking votes.
                                </p>
                                <Link href={events.index.url()}>
                                    <Button variant="outline">
                                        Go to Events
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-semibold">
                        System Overview
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-blue-200 bg-blue-50/50 transition-shadow hover:shadow-md dark:border-blue-800 dark:bg-blue-950/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                    Total Voters
                                </CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                    {stats.total_voters}
                                </div>
                                <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                                    {activeEvent
                                        ? 'In active event'
                                        : 'No active event'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200 bg-purple-50/50 transition-shadow hover:shadow-md dark:border-purple-800 dark:bg-purple-950/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300">
                                    Total Candidates
                                </CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <UserRound className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                    {stats.total_candidates}
                                </div>
                                <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
                                    {activeEvent
                                        ? 'In active event'
                                        : 'No active event'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200 bg-orange-50/50 transition-shadow hover:shadow-md dark:border-orange-800 dark:bg-orange-950/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-300">
                                    Positions
                                </CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                    <ListOrdered className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                    {stats.total_positions}
                                </div>
                                <p className="text-xs text-orange-600/80 dark:text-orange-400/80">
                                    {activeEvent
                                        ? 'In active event'
                                        : 'No active event'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-emerald-200 bg-emerald-50/50 transition-shadow hover:shadow-md dark:border-emerald-800 dark:bg-emerald-950/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                    Voter Turnout
                                </CardTitle>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                    <Vote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-2 flex items-baseline justify-between">
                                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                        {stats.turnout_percentage}%
                                    </div>
                                    <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                                        {stats.votes_cast} of {stats.total_voters}{' '}
                                        voted
                                    </span>
                                </div>
                                <ProgressBar value={stats.turnout_percentage} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-emerald-600" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>
                                Latest voters who cast votes in the active
                                election
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-emerald-200 dark:border-emerald-900">
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                        {initials(log.voter.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {log.voter.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ID: {log.voter.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className="border-emerald-200 bg-emerald-100 text-xs font-normal text-emerald-800 shadow-none hover:bg-emerald-200">
                                                    Voted
                                                </Badge>
                                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                    {log.created_at
                                                        ? new Date(
                                                            log.created_at,
                                                        ).toLocaleTimeString()
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        No recent activity found.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-blue-600" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>
                                Common tasks and shortcuts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href={events.index.url()} className="block">
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start',
                                        'cursor-pointer',
                                    )}
                                >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    Manage Events
                                </Button>
                            </Link>
                            <Link href={voters.index.url()} className="block">
                                <Button
                                    variant="outline"
                                    className="w-full cursor-pointer justify-start"
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Voters
                                </Button>
                            </Link>
                            <Link href={candidates.index.url()} className="block">
                                <Button
                                    variant="outline"
                                    className="w-full cursor-pointer justify-start"
                                >
                                    <UserRound className="mr-2 h-4 w-4" />
                                    Manage Candidates
                                </Button>
                            </Link>
                            <Link href={positions.index.url()} className="block">
                                <Button
                                    variant="outline"
                                    className="w-full cursor-pointer justify-start"
                                >
                                    <ListOrdered className="mr-2 h-4 w-4" />
                                    Manage Positions
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
