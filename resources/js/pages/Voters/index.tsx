import { Head, router, useForm } from '@inertiajs/react';
import {
    EyeIcon,
    PlusIcon,
    PrinterIcon,
    SearchIcon,
    Trash2Icon,
    UploadIcon,
    XIcon,
} from 'lucide-react';
import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import { useMemo, useState } from 'react';
import Pagination from '@/components/paginationData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
    const [bulkUpdating, setBulkUpdating] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
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

    const pageVoterIds = useMemo(() => {
        return new Set(voterList.data.map((v) => v.id));
    }, [voterList.data]);

    const selectedOnPage = useMemo(() => {
        if (selectedIds.size === 0) {
            return new Set<number>();
        }

        const next = new Set<number>();
        selectedIds.forEach((id) => {
            if (pageVoterIds.has(id)) {
                next.add(id);
            }
        });

        return next;
    }, [pageVoterIds, selectedIds]);

    const isAllSelected = useMemo(() => {
        return (
            voterList.data.length > 0 &&
            selectedOnPage.size === voterList.data.length
        );
    }, [selectedOnPage.size, voterList.data.length]);

    const isSomeSelected = useMemo(() => {
        return (
            selectedOnPage.size > 0 &&
            selectedOnPage.size < voterList.data.length
        );
    }, [selectedOnPage.size, voterList.data.length]);

    const toggleSelectAll = (checked: boolean) => {
        if (!checked) {
            setSelectedIds(new Set());

            return;
        }

        setSelectedIds(new Set(voterList.data.map((v) => v.id)));
    };

    const toggleSelected = (voterId: number, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            if (checked) {
                next.add(voterId);
            } else {
                next.delete(voterId);
            }

            return next;
        });
    };

    const setSelectedActive = (isActive: boolean) => {
        if (selectedOnPage.size === 0) {
            return;
        }

        setBulkUpdating(true);
        router.patch(
            '/voters/active',
            {
                is_active: isActive,
                voter_ids: Array.from(selectedOnPage),
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () =>
                    setBulkUpdating(false),
            },
        );

        setSelectedIds(new Set());
    };

    const deleteSelectedVotes = () => {
        if (selectedOnPage.size === 0) {
            return;
        }

        const ok = window.confirm('Delete votes for selected voters?');

        if (!ok) {
            return;
        }

        setBulkUpdating(true);
        router.delete(
            '/voters/votes',
            {
                data: {
                    voter_ids: Array.from(selectedOnPage),
                },
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setBulkUpdating(false),
            },
        );

        setSelectedIds(new Set());
    };

    const deleteVoterVotes = (voterId: number) => {
        const ok = window.confirm('Delete votes for this voter?');

        if (!ok) {
            return;
        }

        router.delete(`/voters/${voterId}/votes`, {
            preserveScroll: true,
            preserveState: true,
        });
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

                {selectedOnPage.size > 0 ? (
                    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm">
                            Selected:{' '}
                            <span className="font-semibold">
                                {selectedOnPage.size}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                size="sm"
                                className="cursor-pointer"
                                disabled={bulkUpdating}
                                onClick={() => setSelectedActive(true)}
                            >
                                Activate selected
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="cursor-pointer"
                                disabled={bulkUpdating}
                                onClick={() => setSelectedActive(false)}
                            >
                                Deactivate selected
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="cursor-pointer"
                                disabled={bulkUpdating}
                                onClick={() => setSelectedIds(new Set())}
                            >
                                Clear
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="cursor-pointer"
                                disabled={bulkUpdating}
                                onClick={deleteSelectedVotes}
                            >
                                <Trash2Icon className="size-4" />
                                Delete votes
                            </Button>
                        </div>
                    </div>
                ) : null}

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
                                <TableHead className="w-[44px]">
                                    <div className="flex items-center justify-center">
                                        <Checkbox
                                            checked={
                                                isAllSelected
                                                    ? true
                                                    : isSomeSelected
                                                        ? 'indeterminate'
                                                        : false
                                            }
                                            disabled={bulkUpdating}
                                            onCheckedChange={(checked) =>
                                                toggleSelectAll(checked === true)
                                            }
                                        />
                                    </div>
                                </TableHead>
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
                                    Online
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
                                            <div className="flex items-center justify-center">
                                                <Checkbox
                                                    checked={selectedOnPage.has(voter.id)}
                                                    disabled={bulkUpdating}
                                                    onCheckedChange={(checked) =>
                                                        toggleSelected(
                                                            voter.id,
                                                            checked === true,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </TableCell>
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
                                            {voter.is_online ? (
                                                <Badge className="border-none bg-emerald-600 text-white hover:bg-emerald-700">
                                                    Online
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
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
                                            <div className="flex flex-col gap-2 sm:flex-row">
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
                                                {voter.has_voted ? (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            deleteVoterVotes(
                                                                voter.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2Icon className="size-4" />
                                                        Delete
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
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
