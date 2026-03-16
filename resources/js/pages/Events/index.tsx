import { Head, router, useForm } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import Pagination from '@/components/paginationData';
import { Badge } from '@/components/ui/badge';
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
import EventCreateDialog from './create';
import EventDeleteDialog from './delete';
import EventEditDialog from './edit';
import VoterImportDialog from './import-voters';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Events',
        href: '/events',
    },
];

type Props = {
    eventList: PaginatedDataResponse<Event>;
    filters: FilterProps;
};

export default function EventsIndex({ eventList, filters }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openImportVoters, setOpenImportVoters] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const { data, setData } = useForm({
        search: filters.search || '',
    });

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            const queryString = data.search
                ? { search: data.search }
                : undefined;
            router.get('/events', queryString, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setData('search', e.target.value);
    };

    const handleEditClick = (event: Event) => {
        setSelectedEvent(event);
        setOpenEdit(true);
    };

    const handleDeleteClick = (event: Event) => {
        setSelectedEvent(event);
        setOpenDelete(true);
    };

    const handleImportVotersClick = (event: Event) => {
        setSelectedEvent(event);
        setOpenImportVoters(true);
    };

    const handleToggleActive = (event: Event) => {
        router.put(
            `/events/${event.id}/active`,
            { is_active: !event.is_active },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setOpenCreate(true)}
                    >
                        <PlusIcon />
                        <span className="rounded-sm lg:inline">Event</span>
                    </Button>

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
                                    Name
                                </TableHead>

                                <TableHead className="font-bold text-primary">
                                    Start
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    End
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
                            {eventList.data.length > 0 ? (
                                eventList.data.map((event) => (
                                    <TableRow
                                        key={event.id}
                                        className="text-sm"
                                    >
                                        <TableCell className="text-sm uppercase">
                                            {event.name || '-'}
                                        </TableCell>

                                        <TableCell className="text-sm">
                                            {event.start_at || '-'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {event.end_at || '-'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div className="flex items-center gap-2">

                                                {event.is_active ? (
                                                    <Badge
                                                        onClick={() =>
                                                            handleToggleActive(
                                                                event,
                                                            )
                                                        }
                                                        variant="secondary"
                                                        className="cursor-pointer bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-300"
                                                    >
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        onClick={() =>
                                                            handleToggleActive(
                                                                event,
                                                            )
                                                        }
                                                        variant="secondary"
                                                        className="cursor-pointer bg-slate-500/10 text-slate-700 hover:bg-slate-500/20 dark:text-slate-300"
                                                    >
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="flex gap-2 text-sm">
                                            <span
                                                onClick={() =>
                                                    handleEditClick(event)
                                                }
                                                className="cursor-pointer text-green-500 hover:text-green-700 hover:underline"
                                            >
                                                Edit
                                            </span>
                                            <span
                                                onClick={() =>
                                                    handleImportVotersClick(
                                                        event,
                                                    )
                                                }
                                                className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                                            >
                                                Import voters
                                            </span>
                                            <span
                                                onClick={() =>
                                                    handleDeleteClick(event)
                                                }
                                                className="cursor-pointer text-red-500 hover:text-orange-700 hover:underline"
                                            >
                                                Delete
                                            </span>
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
                    <Pagination data={eventList} />
                </div>
            </div>
            {openCreate && (
                <EventCreateDialog open={openCreate} setOpen={setOpenCreate} />
            )}
            {openEdit && selectedEvent && (
                <EventEditDialog
                    open={openEdit}
                    setOpen={setOpenEdit}
                    event={selectedEvent}
                />
            )}
            {openDelete && selectedEvent && (
                <EventDeleteDialog
                    open={openDelete}
                    setOpen={setOpenDelete}
                    event={selectedEvent}
                />
            )}
            {openImportVoters && selectedEvent && (
                <VoterImportDialog
                    open={openImportVoters}
                    setOpen={setOpenImportVoters}
                    event={selectedEvent}
                />
            )}
        </AppLayout>
    );
}
