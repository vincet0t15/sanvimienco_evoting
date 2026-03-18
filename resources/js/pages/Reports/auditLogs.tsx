import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes';
import { BreadcrumbItem, Voter } from '@/types';
import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Printer, ShieldCheck } from 'lucide-react';
import Heading from '@/components/heading';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { PaginatedDataResponse } from '@/types/pagination';
import { log } from 'console';
import Pagination from '@/components/paginationData';
import reports from '@/routes/reports';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Audit Logs',
        href: '#',
    },
];

interface Props {
    event: Event;
    voters: PaginatedDataResponse<Voter>
}
function auditLogs({ event, voters }: Props) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <Link href={reports.index.url()} className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <Heading
                        variant="small"
                        title="Election Audit Log"
                        description="Secure chronological record of all voting activities."
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {event.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Total Records: {voters.total}
                        </p>
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                        <a
                            href={`/reports/print-audit-logs/${event.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Printer className="h-4 w-4" />
                            Print Log
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            Voting Activity Log
                        </CardTitle>
                        <CardDescription>
                            This log records the exact time and location of
                            every vote cast. It does not show who the voter
                            voted for.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Voter Name</TableHead>
                                    <TableHead>Voter ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {voters.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No voting activity recorded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    voters.data.map((voter) => (
                                        <TableRow key={voter.id}>

                                            <TableCell className="font-medium">
                                                {voter.name}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {voter.username}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <Pagination data={voters} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}

export default auditLogs