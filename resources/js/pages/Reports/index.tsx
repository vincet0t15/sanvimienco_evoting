import { Head, Link, router } from '@inertiajs/react';
import { FileText, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/components/paginationData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import reports from '@/routes/reports';
import type { BreadcrumbItem } from '@/types';
import type { FilterProps } from '@/types/filter';

type EventPayload = {
    id: number;
    name: string;
    is_active: boolean;
    start_at: string | null;
    end_at: string | null;
};

type StatsPayload = {
    total_voters: number;
    votes_cast: number;
    turnout_percentage: number;
    did_not_vote: number;
};

type CandidatePayload = {
    id: number;
    name: string;
    photo_url: string | null;
    votes_count: number;
    percent?: number;
    rank?: number;
    is_winner?: boolean;
};

type PositionPayload = {
    id: number;
    name: string;
    max_vote: number;
    total_votes: number;
    abstentions: number;
    candidates: CandidatePayload[];
};

type CandidateRow = {
    id: number;
    name: string;
    photo_url: string | null;
    position_name: string | null;
    votes_count: number;
};

type VoterRow = {
    id: number;
    name: string;
    username: string;
    has_voted: boolean;
    is_active: boolean;
};

type PaginatedDataResponse<T> = {
    current_page: number;
    from: number;
    to: number;
    last_page: number;
    path: string;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    data: T[];
};

type Props = {
    event: EventPayload | null;
    stats: StatsPayload;
    positions: PositionPayload[];
    candidates: CandidateRow[];
    voters: PaginatedDataResponse<VoterRow> | null;
    filters: FilterProps
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Reports',
        href: reports.index.url(),
    },
];

function formatDate(value: string | null) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function ReportsIndex({
    event,
    stats,
    positions,
    candidates,
    voters,
    filters,
}: Props) {
    const initials = useInitials();
    const [tab, setTab] = useState<'results' | 'candidates' | 'voters'>(
        'results',
    );

    const tabs = [
        { label: 'All', value: 'all' },
        { label: 'Voted', value: '1' },
        { label: 'Not Voted', value: '0' },
    ];
    const [voterStatusTab, setVoterStatusTab] = useState<string>(
        filters.statusId ?? 'all',
    );

    const handleTabChange = (value: string) => {
        const params: Record<string, string> = {};

        if (value !== 'all') {
            params.statusId = value;
        }

        router.get(reports.index.url(), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Report Details
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View detailed voting results and statistics.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                        <Button variant="outline" >
                            <Link href={'/reports/audit-logs/' + event?.id} className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Audit Log
                            </Link>
                        </Button>

                        <Button
                            onClick={() => window.print()}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            <FileText className="h-4 w-4" />
                            Official Report
                        </Button>
                    </div>
                </div>

                {!event ? (
                    <Card className="border-2 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                            <div className="rounded-full bg-muted/50 p-4">
                                <Users className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">
                                No Active Election
                            </h3>
                            <p className="max-w-xl text-sm text-muted-foreground">
                                Activate an election event to generate a
                                report.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-xl font-semibold">
                                    {event.name}
                                </h2>
                                {event.is_active ? (
                                    <Badge className="bg-emerald-600 text-white">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Inactive</Badge>
                                )}
                                {formatDate(event.start_at) ? (
                                    <span className="text-sm text-muted-foreground">
                                        {formatDate(event.start_at)}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>
                                        Total Voters
                                    </CardDescription>
                                    <CardTitle className="text-3xl">
                                        {stats.total_voters}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-muted-foreground">
                                    Assigned voters
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>
                                        Votes Cast
                                    </CardDescription>
                                    <CardTitle className="text-3xl">
                                        {stats.votes_cast}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-muted-foreground">
                                    Distinct voters who voted
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>Turnout</CardDescription>
                                    <CardTitle className="text-3xl">
                                        {stats.turnout_percentage}%
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Progress value={stats.turnout_percentage} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardDescription>
                                        Did Not Vote
                                    </CardDescription>
                                    <CardTitle className="text-3xl">
                                        {stats.did_not_vote}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-muted-foreground">
                                    Pending voters
                                </CardContent>
                            </Card>
                        </div>

                        <ToggleGroup
                            type="single"
                            value={tab}
                            onValueChange={(value) => {
                                if (
                                    value === 'results' ||
                                    value === 'candidates' ||
                                    value === 'voters'
                                ) {
                                    setTab(value);
                                }
                            }}
                            variant="outline"
                            className="w-fit"
                        >
                            <ToggleGroupItem value="results">
                                Results
                            </ToggleGroupItem>
                            <ToggleGroupItem value="candidates">
                                Candidates
                            </ToggleGroupItem>
                            <ToggleGroupItem value="voters">
                                Voters
                            </ToggleGroupItem>
                        </ToggleGroup>

                        {tab === 'results' ? (
                            <div className="space-y-4">
                                {positions.map((position) => (
                                    <Card key={position.id}>
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base">
                                                {position.name}
                                            </CardTitle>
                                            <CardDescription>
                                                Total Votes:{' '}
                                                {position.total_votes}{' '}
                                                &nbsp;&nbsp; Abstentions:{' '}
                                                {position.abstentions}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {position.candidates.length === 0 ? (
                                                <div className="text-sm text-muted-foreground">
                                                    No candidates found.
                                                </div>
                                            ) : (
                                                position.candidates.map(
                                                    (candidate) => (
                                                        <div
                                                            key={candidate.id}
                                                            className="space-y-2"
                                                        >
                                                            <div className="flex items-center justify-between gap-4">
                                                                <div className="flex min-w-0 items-center gap-3">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="w-10 justify-center"
                                                                    >
                                                                        #
                                                                        {candidate.rank ??
                                                                            0}
                                                                    </Badge>
                                                                    <div className="relative">
                                                                        <Avatar className="h-9 w-9 border">
                                                                            <AvatarImage
                                                                                src={
                                                                                    candidate.photo_url ??
                                                                                    undefined
                                                                                }
                                                                                alt={
                                                                                    candidate.name
                                                                                }
                                                                            />
                                                                            <AvatarFallback>
                                                                                {initials(
                                                                                    candidate.name,
                                                                                )}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <p className="truncate text-sm font-semibold">
                                                                                {
                                                                                    candidate.name
                                                                                }
                                                                            </p>
                                                                            {candidate.is_winner ? (
                                                                                <Badge className="bg-amber-500 text-amber-950">
                                                                                    Winner
                                                                                </Badge>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="shrink-0 text-right">
                                                                    <p className="text-sm font-semibold">
                                                                        {
                                                                            candidate.votes_count
                                                                        }{' '}
                                                                        votes
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {candidate.percent ??
                                                                            0}
                                                                        %
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Progress
                                                                value={
                                                                    candidate.percent ??
                                                                    0
                                                                }
                                                            />
                                                        </div>
                                                    ),
                                                )
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : null}

                        {tab === 'candidates' ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Candidates
                                    </CardTitle>
                                    <CardDescription>
                                        Candidate list and vote totals
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    Candidate
                                                </TableHead>
                                                <TableHead>
                                                    Position
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Votes
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {candidates.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8 border">
                                                                <AvatarImage
                                                                    src={
                                                                        row.photo_url ??
                                                                        undefined
                                                                    }
                                                                    alt={row.name}
                                                                />
                                                                <AvatarFallback>
                                                                    {initials(
                                                                        row.name,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-medium">
                                                                {row.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.position_name ??
                                                            '—'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {row.votes_count}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        ) : null}

                        {tab === 'voters' ? (
                            <Card>
                                <CardHeader className='justify-between flex items-center'>
                                    <div>
                                        <CardTitle className="text-base">
                                            Voters
                                        </CardTitle>
                                        <CardDescription>
                                            Voting status for the selected event
                                        </CardDescription>
                                    </div>
                                    <div>
                                        <Tabs
                                            value={voterStatusTab}
                                            onValueChange={(value) => {
                                                setVoterStatusTab(value);
                                                handleTabChange(value);
                                            }}
                                        >
                                            <TabsList>
                                                {tabs.map((t, index) => (
                                                    <TabsTrigger
                                                        key={index}
                                                        value={t.value}
                                                    >
                                                        {t.label}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {!voters ? (
                                        <div className="text-sm text-muted-foreground">
                                            No voters found.
                                        </div>
                                    ) : (
                                        <>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Name
                                                        </TableHead>
                                                        <TableHead>
                                                            ID
                                                        </TableHead>
                                                        <TableHead>
                                                            Status
                                                        </TableHead>
                                                        <TableHead>
                                                            Account
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {voters.data.map(
                                                        (row) => (
                                                            <TableRow
                                                                key={row.id}
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {row.name}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        row.username
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {row.has_voted ? (
                                                                        <Badge className="bg-emerald-600 text-white">
                                                                            Voted
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="outline">
                                                                            Not
                                                                            voted
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {row.is_active ? (
                                                                        <Badge variant="secondary">
                                                                            Active
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="destructive">
                                                                            Inactive
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                            <Pagination data={voters} />
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ) : null}
                    </>
                )}
            </div>
        </AppLayout>
    );
}


