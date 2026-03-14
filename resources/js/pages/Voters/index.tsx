import { Head, router, useForm } from '@inertiajs/react';
import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import { useState } from 'react';
import Pagination from '@/components/paginationData';
import { Button } from '@/components/ui/button';
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

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            const queryString = data.search
                ? { search: data.search }
                : undefined;
            router.get('/voters', queryString, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setData('search', e.target.value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Voters" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => setOpenCreate(true)}
                        >
                            Add voter
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => setOpenImport(true)}
                        >
                            Import voters
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            onKeyDown={handleKeyDown}
                            onChange={handleSearchChange}
                            placeholder="Search..."
                            value={data.search}
                        />
                    </div>
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {voterList.data.length > 0 ? (
                                voterList.data.map((voter) => (
                                    <TableRow
                                        key={voter.id}
                                        className="text-sm"
                                    >
                                        <TableCell className="text-sm">
                                            {voter.event?.name ?? '-'}
                                        </TableCell>
                                        <TableCell className="text-sm uppercase">
                                            {voter.name}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {voter.username}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {voter.is_active ? 'Yes' : 'No'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
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
