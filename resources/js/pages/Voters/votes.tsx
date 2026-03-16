import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import voters from '@/routes/voters';
import type { BreadcrumbItem } from '@/types';

type Props = {
    voter: {
        id: number;
        name: string;
        username: string;
        has_voted: boolean;
        event: { id: number; name: string } | null;
    };
    positions: {
        position: { id: number; name: string };
        candidates: { id: number; name: string }[];
    }[];
    vote_count: number;
    voted_at: string | null;
};

export default function VoterVotes({ voter, positions, vote_count, voted_at }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Voters', href: voters.index.url() },
        { title: 'Votes', href: `/voters/${voter.id}/votes` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Votes - ${voter.name}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href={voters.index.url()}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="size-4" />
                                    Back
                                </Button>
                            </Link>
                            <div className="text-xl font-semibold tracking-tight">
                                {voter.name}
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Username: <span className="font-mono">{voter.username}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {voter.event ? (
                            <Badge variant="outline">{voter.event.name}</Badge>
                        ) : (
                            <Badge variant="secondary">No event</Badge>
                        )}
                        {voter.has_voted ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">
                                <CheckCircle2 className="mr-1 size-4" />
                                Voted
                            </Badge>
                        ) : (
                            <Badge variant="secondary">Not voted</Badge>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Votes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {vote_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {voted_at ? `Last vote: ${new Date(voted_at).toLocaleString()}` : 'No votes recorded'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Selections</CardTitle>
                            <CardDescription>
                                Candidates selected by this voter (grouped by position).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full overflow-hidden rounded-sm border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="font-bold text-primary">
                                                Position
                                            </TableHead>
                                            <TableHead className="font-bold text-primary">
                                                Candidate(s)
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {positions.length > 0 ? (
                                            positions.map((row) => (
                                                <TableRow key={row.position.id}>
                                                    <TableCell className="font-medium">
                                                        {row.position.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.candidates.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {row.candidates.map((c) => (
                                                                    <Badge key={c.id} variant="secondary">
                                                                        {c.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                                                    No votes found for this voter.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
