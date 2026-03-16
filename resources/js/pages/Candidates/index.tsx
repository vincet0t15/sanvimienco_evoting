import { Head, router, useForm } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { FilterProps } from '@/types/filter';
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
    positions: Pick<Position, 'id' | 'name' | 'max_vote'>[];
    positionsByEvent: Record<string, Pick<Position, 'id' | 'name' | 'max_vote'>[]>;
    positionId: number;
    candidateList: Candidate[];
    filters: FilterProps;
};

export default function CandidatesIndex({
    events,
    eventId,
    positions,
    positionsByEvent,
    positionId,
    candidateList,
    filters,
}: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<number>(eventId);
    const [selectedPositionId, setSelectedPositionId] = useState<number>(positionId);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
        null,
    );
    const { data, setData } = useForm({
        search: filters.search || '',
    });

    const eventPositions = useMemo(() => {
        return positionsByEvent[String(selectedEventId)] ?? positions;
    }, [positions, positionsByEvent, selectedEventId]);

    const createPositionId = useMemo(() => {
        return Number(eventPositions[0]?.id ?? 0);
    }, [eventPositions]);

    const candidatesByPosition = useMemo(() => {
        const groups: Record<number, Candidate[]> = {};

        for (const candidate of candidateList) {
            if (!groups[candidate.position_id]) {
                groups[candidate.position_id] = [];
            }

            groups[candidate.position_id]?.push(candidate);
        }

        return groups;
    }, [candidateList]);

    const shownPositions = useMemo(() => {
        if (selectedPositionId > 0) {
            return eventPositions.filter((p) => p.id === selectedPositionId);
        }

        return eventPositions;
    }, [eventPositions, selectedPositionId]);

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            const queryString = data.search ? { search: data.search } : undefined;
            router.get(
                '/candidates',
                {
                    event_id: selectedEventId,
                    position_id: selectedPositionId || undefined,
                    ...queryString,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setData('search', e.target.value);
    };

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
                <div className="flex w-full flex-col gap-1">
                    <div className="text-xl font-semibold tracking-tight">
                        Candidates
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Create and manage candidate profiles, positions, and
                        assignments.
                    </div>
                </div>

                <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => setOpenCreate(true)}
                            disabled={events.length === 0}
                        >
                            <PlusIcon />
                            <span className="rounded-sm lg:inline">
                                Candidate
                            </span>
                        </Button>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                        <Select
                            value={String(selectedEventId || '')}
                            onValueChange={(value) => {
                                const nextEventId = Number(value);
                                setSelectedEventId(nextEventId);
                                setSelectedPositionId(0);

                                router.get(
                                    '/candidates',
                                    {
                                        event_id: nextEventId,
                                        search: data.search || undefined,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-80">
                                <SelectValue placeholder="All Events" />
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
                            value={String(selectedPositionId || 0)}
                            onValueChange={(value) => {
                                const nextPositionId = Number(value);
                                setSelectedPositionId(nextPositionId);

                                router.get(
                                    '/candidates',
                                    {
                                        event_id: selectedEventId,
                                        position_id:
                                            nextPositionId || undefined,
                                        search: data.search || undefined,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                            disabled={!selectedEventId || eventPositions.length === 0}
                        >
                            <SelectTrigger className="w-full sm:w-72">
                                <SelectValue placeholder="All Positions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">
                                    All Positions
                                </SelectItem>
                                {eventPositions.map((position) => (
                                    <SelectItem
                                        key={position.id}
                                        value={String(position.id)}
                                    >
                                        {position.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            className="w-full sm:w-64"
                            placeholder="Search candidates..."
                            value={data.search}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                </div>

                <div className="space-y-5">
                    {shownPositions.length > 0 ? (
                        shownPositions.map((position) => {
                            const group =
                                candidatesByPosition[position.id] ?? [];

                            if (group.length === 0) {
                                return null;
                            }

                            const maxVote = Number(position.max_vote ?? 1);
                            const willWinLabel =
                                maxVote === 1
                                    ? 'Top 1 candidate will win'
                                    : `Top ${maxVote} candidates will win`;

                            return (
                                <div key={position.id} className="space-y-2">
                                    <div>
                                        <div className="text-lg font-semibold">
                                            {position.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {willWinLabel}
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
                                                    <TableHead className="text-right font-bold text-primary">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {group.map((candidate) => (
                                                    <TableRow
                                                        key={candidate.id}
                                                        className="items-center text-sm"
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
                                                        <TableCell className="text-right text-sm">
                                                            <div className="flex justify-end gap-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEditClick(
                                                                            candidate,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer text-green-500 hover:text-green-700 hover:underline"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteClick(
                                                                            candidate,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer text-red-500 hover:text-orange-700 hover:underline"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            No positions available.
                        </div>
                    )}

                    {shownPositions.length > 0 &&
                        Object.values(candidatesByPosition).flat().length ===
                        0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            No candidates found.
                        </div>
                    ) : null}
                </div>
            </div>

            {openCreate && (
                <CandidateCreateDialog
                    open={openCreate}
                    setOpen={setOpenCreate}
                    events={events}
                    eventId={selectedEventId}
                    positionsByEvent={positionsByEvent}
                    positionId={createPositionId}
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
