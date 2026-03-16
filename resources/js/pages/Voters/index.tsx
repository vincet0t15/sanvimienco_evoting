import { Head, router, useForm } from '@inertiajs/react';
import { EyeIcon, PlusIcon, PrinterIcon, SearchIcon, UploadIcon, XIcon } from 'lucide-react';
import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import { useMemo, useState } from 'react';
import Pagination from '@/components/paginationData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Event } from '@/types/event';
import type { FilterProps } from '@/types/filter';
import type { PaginatedDataResponse } from '@/types/pagination';
import type { Voter } from '@/types/voter';
import VoterCreateDialog from './create';
import VoterImportDialog from './import-voters';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Voters',
        href: '/voters',
    },
];

type Props = {
    events: Pick<Event, 'id' | 'name'>[];
    voterList: PaginatedDataResponse<Voter>;
    filters: FilterProps;
};

export default function VotersIndex({ voterList, filters, events }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [openImport, setOpenImport] = useState(false);
    const { data, setData } = useForm({
        search: filters.search || '',
    });

    const activeCount = useMemo(() => {
        return voterList.data.reduce(
            (acc, voter) => acc + (voter.is_active ? 1 : 0),
            0,
        );
    }, [voterList.data]);

    const inactiveCount = useMemo(() => {
        return voterList.data.length - activeCount;
    }, [activeCount, voterList.data.length]);

    const applySearch = () => {
        const queryString = data.search ? { search: data.search } : undefined;

        router.get('/voters', queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearSearch = () => {
        setData('search', '');
        router.get('/voters', undefined, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            applySearch();
        }
    };

    const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setData('search', e.target.value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Voters" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="text-xl font-semibold tracking-tight">
                            Voters
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Manage voter accounts and access.
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => {
                                const url = data.search
                                    ? `/voters/print?search=${encodeURIComponent(
                                        data.search,
                                    )}`
                                    : '/voters/print';

                                window.open(url, '_blank');
                            }}
                        >
                            <PrinterIcon className="size-4" />
                            Print slips
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => setOpenImport(true)}
                        >
                            <UploadIcon className="size-4" />
                            Import
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => setOpenCreate(true)}
                        >
                            <PlusIcon className="size-4" />
                            Voter
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total voters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {voterList.total}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                On this page
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-2">
                            <div className="text-2xl font-semibold">
                                {voterList.data.length}
                            </div>
                            <Badge
                                variant="secondary"
                                className="bg-green-500/10 text-green-700 dark:text-green-300"
                            >
                                {activeCount} active
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="bg-red-500/10 text-red-700 dark:text-red-300"
                            >
                                {inactiveCount} inactive
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                            <div className="relative w-full">
                                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9 pr-9"
                                    onKeyDown={handleKeyDown}
                                    onChange={handleSearchChange}
                                    placeholder="Name or username..."
                                    value={data.search}
                                />
                                {data.search ? (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-muted"
                                    >
                                        <XIcon className="size-4" />
                                    </button>
                                ) : null}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={applySearch}
                            >
                                Go
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold text-primary">
                                    Event
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    Name
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    Username
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    Active
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {voterList.data.length > 0 ? (
                                voterList.data.map((voter) => (
                                    <TableRow
                                        key={voter.id}
                                        className="text-sm hover:bg-muted/30"
                                    >
                                        <TableCell className="text-sm">
                                            {voter.event?.name ? (
                                                <Badge
                                                    variant="outline"
                                                    className="font-normal"
                                                >
                                                    {voter.event.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm uppercase">
                                            {voter.name}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {voter.username}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {voter.is_active ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-green-500/10 text-green-700 dark:text-green-300"
                                                >
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-red-500/10 text-red-700 dark:text-red-300"
                                                >
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.get(
                                                        `/voters/${voter.id}/votes`,
                                                    )
                                                }
                                            >
                                                <EyeIcon className="size-4" />
                                                Votes
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-3 text-center text-gray-500"
                                    >
                                        No data available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div>
                    <Pagination data={voterList} />
                </div>
            </div>
            {openImport && (
                <VoterImportDialog
                    open={openImport}
                    setOpen={setOpenImport}
                    events={events}
                />
            )}
            {openCreate && (
                <VoterCreateDialog
                    open={openCreate}
                    setOpen={setOpenCreate}
                    events={events}
                />
            )}
        </AppLayout>
    );
}
