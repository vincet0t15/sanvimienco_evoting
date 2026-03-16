import { Head, router } from '@inertiajs/react';
import { AlertCircle, Clock, Medal, Trophy, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Candidate = {
    id: number;
    name: string;
    photo_url: string | null;
    votes_count: number;
};

type Position = {
    id: number;
    name: string;
    max_vote: number;
    candidates: Candidate[];
};

type Event = {
    id: number;
    name: string;
    is_active: boolean;
    start_at: string;
    end_at: string;
};

type Props = {
    event: Event | null;
    positions: Position[];
    can_show_results: boolean;
};

function calculateTimeLeft(endTime: string) {
    const now = new Date().getTime();
    const distance = new Date(endTime).getTime() - now;

    if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
}

export default function ResultsIndex({ event, positions, can_show_results }: Props) {
    const [timeLeft, setTimeLeft] = useState<ReturnType<
        typeof calculateTimeLeft
    > | null>(() => {
        if (event?.is_active && event.end_at) {
            return calculateTimeLeft(event.end_at);
        }

        return null;
    });

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isRefreshingRef = useRef(false);
    const refreshDataRef = useRef<() => void>(() => { });

    const refreshData = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        isRefreshingRef.current = true;
        router.reload({
            only: ['event', 'positions'],
            onFinish: () => {
                isRefreshingRef.current = false;

                if (!document.hidden) {
                    timeoutRef.current = setTimeout(() => {
                        refreshDataRef.current();
                    }, 10000);
                }
            },
        });
    }, []);

    useEffect(() => {
        refreshDataRef.current = refreshData;
    }, [refreshData]);

    useEffect(() => {
        refreshData();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            } else if (!isRefreshingRef.current && !timeoutRef.current) {
                refreshData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, [refreshData]);

    useEffect(() => {
        if (event?.is_active && event.end_at) {
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft(event.end_at));
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [event]);

    const isTimeUp =
        timeLeft?.days === 0 &&
        timeLeft?.hours === 0 &&
        timeLeft?.minutes === 0 &&
        timeLeft?.seconds === 0;

    const showResults = can_show_results;
    const showLiveBadge = Boolean(event?.is_active && !isTimeUp);

    const getTotalVotes = (candidates: Candidate[]) =>
        candidates.reduce((sum, candidate) => sum + candidate.votes_count, 0);

    const pageDescription = event
        ? `Live updates for ${event.name}`
        : 'No active event found';

    const totals = useMemo(() => {
        const totalVotes = positions.reduce((acc, pos) => {
            return acc + getTotalVotes(pos.candidates);
        }, 0);

        return { totalVotes };
    }, [positions]);

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 text-foreground dark:bg-slate-950/50">
            <Head title="Election Results" />

            <div className="mb-8 border-b bg-white shadow-sm dark:bg-slate-900">
                <div className="mx-auto flex max-w-5xl flex-col items-center justify-center space-y-6 px-4 py-12 text-center md:px-6">
                    <div className="space-y-2">
                        <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
                            Election Results
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            {pageDescription}
                        </p>
                        {event ? (
                            <p className="text-sm text-muted-foreground">
                                Total votes recorded: {totals.totalVotes}
                            </p>
                        ) : null}
                    </div>

                    {showLiveBadge && timeLeft ? (
                        <div className="flex animate-in flex-col items-center duration-500 fade-in">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium tracking-widest text-emerald-600 uppercase">
                                <Clock className="h-4 w-4 animate-pulse" />
                                Voting Ends In
                            </div>
                            <div className="grid grid-cols-4 gap-3 md:gap-6">
                                {[
                                    { label: 'Days', value: timeLeft.days },
                                    { label: 'Hours', value: timeLeft.hours },
                                    { label: 'Minutes', value: timeLeft.minutes },
                                    { label: 'Seconds', value: timeLeft.seconds },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex flex-col items-center"
                                    >
                                        <div className="relative mb-2 flex h-20 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg md:h-28 md:w-24 dark:border-slate-700 dark:bg-slate-800">
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50" />
                                            <span className="font-mono text-3xl font-bold tabular-nums text-slate-800 md:text-5xl dark:text-slate-100">
                                                {String(item.value).padStart(
                                                    2,
                                                    '0',
                                                )}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:text-xs">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <Badge
                                    variant="outline"
                                    className="animate-pulse border-emerald-500/50 bg-emerald-50 px-4 py-1 text-emerald-600 shadow-sm dark:bg-emerald-950/20"
                                >
                                    <span className="relative mr-2 flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                    </span>
                                    Live Updates Enabled
                                </Badge>
                            </div>
                        </div>
                    ) : null}

                    {event?.is_active && isTimeUp ? (
                        <div className="flex flex-col items-center">
                            <Badge className="bg-emerald-600 px-6 py-2 text-base text-white shadow-md hover:bg-emerald-700">
                                Voting Ended - Results Finalized
                            </Badge>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 md:px-6">
                {!event ? (
                    <Card className="mx-auto mt-10 max-w-lg border-2 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 rounded-full bg-muted/50 p-4">
                                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">
                                No Results Available
                            </h3>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                There is no active election event to display
                                results for.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="mx-auto grid w-full gap-8">
                        {!showResults ? (
                            <Card className="border-2 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                                    <div className="mb-2 rounded-full bg-muted/50 p-4">
                                        <AlertCircle className="h-7 w-7 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">
                                        Results are hidden
                                    </h3>
                                    <p className="max-w-xl text-sm text-muted-foreground">
                                        Results will be available once the event
                                        reaches the end time.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : null}

                        {positions.map((position) => {
                            const totalVotes = getTotalVotes(position.candidates);

                            return (
                                <Card
                                    key={position.id}
                                    className="animate-in overflow-hidden border-none bg-white/80 shadow-md backdrop-blur-sm duration-700 fade-in slide-in-from-bottom-4 dark:bg-slate-900/80"
                                >
                                    <CardHeader className="border-b bg-slate-50/80 pb-4 dark:bg-slate-800/50">
                                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                                    {position.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    Top {position.max_vote}{' '}
                                                    {position.max_vote > 1
                                                        ? 'candidates'
                                                        : 'candidate'}{' '}
                                                    will win
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="w-fit border bg-white px-3 py-1 text-sm shadow-sm dark:bg-slate-800"
                                            >
                                                Total Votes:{' '}
                                                {totalVotes.toLocaleString()}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow className="hover:bg-transparent">
                                                        <TableHead className="w-[80px] text-center font-bold">
                                                            Rank
                                                        </TableHead>
                                                        <TableHead className="min-w-[200px] font-bold">
                                                            Candidate
                                                        </TableHead>
                                                        <TableHead className="w-[120px] text-right font-bold">
                                                            Votes
                                                        </TableHead>
                                                        <TableHead className="w-[35%] min-w-[150px] font-bold">
                                                            Percentage
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {position.candidates.length ===
                                                        0 ? (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={4}
                                                                className="h-32 text-center text-muted-foreground"
                                                            >
                                                                No candidates for
                                                                this position.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        position.candidates.map(
                                                            (candidate, index) => {
                                                                const percentage =
                                                                    totalVotes > 0
                                                                        ? Math.round(
                                                                            (candidate.votes_count /
                                                                                totalVotes) *
                                                                            100,
                                                                        )
                                                                        : 0;

                                                                const rank =
                                                                    index + 1;
                                                                const isWinner =
                                                                    rank <=
                                                                    position.max_vote &&
                                                                    candidate.votes_count >
                                                                    0;

                                                                return (
                                                                    <TableRow
                                                                        key={
                                                                            candidate.id
                                                                        }
                                                                        className={
                                                                            showResults && isWinner
                                                                                ? 'bg-emerald-50/30 hover:bg-emerald-50/50 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20'
                                                                                : 'hover:bg-muted/30'
                                                                        }
                                                                    >
                                                                        <TableCell className="py-4 text-center">
                                                                            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                                                                                {rank}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="py-4">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="relative shrink-0">
                                                                                    <Avatar className="h-12 w-12 border-2 border-slate-200 shadow-sm dark:border-slate-700">
                                                                                        {showResults ? (
                                                                                            <AvatarImage
                                                                                                src={
                                                                                                    candidate.photo_url ??
                                                                                                    undefined
                                                                                                }
                                                                                                alt={
                                                                                                    candidate.name
                                                                                                }
                                                                                                className="object-cover"
                                                                                            />
                                                                                        ) : null}
                                                                                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                                                                                            <User className="h-6 w-6 text-slate-400" />
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                    {showResults &&
                                                                                    isWinner &&
                                                                                        rank ===
                                                                                        1 ? (
                                                                                        <div className="absolute -top-2 -right-2 rounded-full border-2 border-white bg-yellow-400 p-1.5 text-yellow-900 shadow-lg dark:border-slate-900">
                                                                                            <Trophy className="h-3 w-3 fill-current md:h-4 md:w-4" />
                                                                                        </div>
                                                                                    ) : null}
                                                                                    {showResults &&
                                                                                    isWinner &&
                                                                                        rank ===
                                                                                        2 ? (
                                                                                        <div className="absolute -top-2 -right-2 rounded-full border-2 border-white bg-slate-300 p-1.5 text-slate-800 shadow-lg dark:border-slate-900">
                                                                                            <Medal className="h-3 w-3 fill-current md:h-4 md:w-4" />
                                                                                        </div>
                                                                                    ) : null}
                                                                                    {showResults &&
                                                                                    isWinner &&
                                                                                        rank ===
                                                                                        3 ? (
                                                                                        <div className="absolute -top-2 -right-2 rounded-full border-2 border-white bg-orange-400 p-1.5 text-orange-900 shadow-lg dark:border-slate-900">
                                                                                            <Medal className="h-3 w-3 fill-current md:h-4 md:w-4" />
                                                                                        </div>
                                                                                    ) : null}
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <h4 className="text-base font-bold leading-tight text-slate-700 md:text-lg dark:text-slate-200">
                                                                                        {showResults
                                                                                            ? candidate.name
                                                                                            : 'Tallying...'}
                                                                                    </h4>
                                                                                    {showResults && isWinner ? (
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className="mt-1 w-fit border-emerald-300/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                                                                        >
                                                                                            Winner
                                                                                        </Badge>
                                                                                    ) : null}
                                                                                </div>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="py-4 text-right">
                                                                            <div className="font-mono text-lg font-bold leading-none">
                                                                                {showResults
                                                                                    ? candidate.votes_count.toLocaleString()
                                                                                    : '—'}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="py-4">
                                                                            <div className="flex items-center gap-3">
                                                                                <Progress
                                                                                    value={
                                                                                        showResults ? percentage : 0
                                                                                    }
                                                                                    className="h-2.5 flex-1 bg-emerald-100/50 dark:bg-emerald-900/20"
                                                                                    indicatorClassName="bg-emerald-500"
                                                                                />
                                                                                <span className="w-10 text-right text-xs font-medium">
                                                                                    {showResults
                                                                                        ? `${percentage}%`
                                                                                        : '—'}
                                                                                </span>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            },
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
