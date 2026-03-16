import { Head, router } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import type { Candidate } from '@/types/candidate';
import type { Event } from '@/types/event';
import type { Position } from '@/types/position';
import CandidateCreateDialog from './create';
import CandidateDeleteDialog from './delete';
import CandidateEditDialog from './edit';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Candidates',
        href: '/candidates',
    },
];

type Props = {
    events: Pick<Event, 'id' | 'name'>[];
    eventId: number;
    positions: Pick<Position, 'id' | 'name'>[];
    positionsByEvent: Record<string, Pick<Position, 'id' | 'name'>[]>;
    positionId: number;
    candidateList: Candidate[];
};

export default function CandidatesIndex({
    events,
    eventId,
    positions,
    positionsByEvent,
    positionId,
    candidateList,
}: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
        null,
    );

    const handleEditClick = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setOpenEdit(true);
    };

    const handleDeleteClick = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setOpenDelete(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Candidates" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setOpenCreate(true)}
                        disabled={events.length === 0}
                    >
                        <PlusIcon />
                        <span className="rounded-sm lg:inline">Candidate</span>
                    </Button>

                    <div className="flex flex-col items-center gap-2 sm:flex-row">
                        <Select
                            value={String(eventId || '')}
                            onValueChange={(value) => {
                                router.get(
                                    '/candidates',
                                    { event_id: value },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events.map((event) => (
                                    <SelectItem
                                        key={event.id}
                                        value={String(event.id)}
                                    >
                                        {event.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={String(positionId || '')}
                            onValueChange={(value) => {
                                router.get(
                                    '/candidates',
                                    { event_id: eventId, position_id: value },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                            disabled={!eventId || positions.length === 0}
                        >
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                {positions.map((position) => (
                                    <SelectItem
                                        key={position.id}
                                        value={String(position.id)}
                                    >
                                        {position.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="w-full overflow-hidden rounded-sm border shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold text-primary">
                                    Photo
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    Name
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {candidateList.length > 0 ? (
                                candidateList.map((candidate) => (
                                    <TableRow
                                        key={candidate.id}
                                        className="text-sm items-center"
                                    >
                                        <TableCell className="text-sm">
                                            <div className="h-10 w-10 overflow-hidden rounded-md border">
                                                {candidate.photo_url ? (
                                                    <img
                                                        src={candidate.photo_url}
                                                        alt={candidate.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                                                        N/A
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm uppercase">
                                            {candidate.name}
                                        </TableCell>
                                        <TableCell className="flex gap-2 text-sm items-center">
                                            <span
                                                onClick={() =>
                                                    handleEditClick(candidate)
                                                }
                                                className="cursor-pointer text-green-500 hover:text-green-700 hover:underline"
                                            >
                                                Edit
                                            </span>
                                            <span
                                                onClick={() =>
                                                    handleDeleteClick(candidate)
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
                                        colSpan={3}
                                        className="py-3 text-center text-gray-500"
                                    >
                                        No data available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {openCreate && (
                <CandidateCreateDialog
                    open={openCreate}
                    setOpen={setOpenCreate}
                    events={events}
                    eventId={eventId}
                    positionsByEvent={positionsByEvent}
                    positionId={positionId}
                />
            )}
            {openEdit && selectedCandidate && (
                <CandidateEditDialog
                    open={openEdit}
                    setOpen={setOpenEdit}
                    candidate={selectedCandidate}
                    positions={positions}
                />
            )}
            {openDelete && selectedCandidate && (
                <CandidateDeleteDialog
                    open={openDelete}
                    setOpen={setOpenDelete}
                    candidate={selectedCandidate}
                />
            )}
        </AppLayout>
    );
}
