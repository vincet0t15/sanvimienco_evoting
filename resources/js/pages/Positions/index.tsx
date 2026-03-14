import { Head, router } from '@inertiajs/react';
import { GripVerticalIcon, PlusIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
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
import type { Event } from '@/types/event';
import type { Position } from '@/types/position';
import PositionCreateDialog from './create';
import PositionDeleteDialog from './delete';
import PositionEditDialog from './edit';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Positions',
        href: '/positions',
    },
];

type Props = {
    events: Pick<Event, 'id' | 'name'>[];
    eventId: number;
    positionList: Position[];
};

function reorderArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const next = [...array];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    return next;
}

function PositionTable({
    eventId,
    positions: initialPositions,
    onEdit,
    onDelete,
}: {
    eventId: number;
    positions: Position[];
    onEdit: (position: Position) => void;
    onDelete: (position: Position) => void;
}) {
    const [positions, setPositions] = useState(initialPositions);
    const draggingIdRef = useRef<number | null>(null);

    const persistOrder = (ordered: Position[]) => {
        router.post(
            '/positions/reorder',
            {
                event_id: eventId,
                ordered_ids: ordered.map((p) => p.id),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Order updated');
                },
            },
        );
    };

    return (
        <div className="w-full overflow-hidden rounded-sm border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-10 font-bold text-primary">
                            #
                        </TableHead>
                        <TableHead className="font-bold text-primary">
                            Name
                        </TableHead>
                        <TableHead className="font-bold text-primary">
                            Max vote
                        </TableHead>
                        <TableHead className="font-bold text-primary">
                            Action
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {positions.length > 0 ? (
                        positions.map((position, index) => (
                            <TableRow
                                key={position.id}
                                draggable
                                onDragStart={() => {
                                    draggingIdRef.current = position.id;
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}
                                onDrop={() => {
                                    const draggingId = draggingIdRef.current;
                                    draggingIdRef.current = null;

                                    if (!draggingId || draggingId === position.id) {
                                        return;
                                    }

                                    const fromIndex = positions.findIndex(
                                        (p) => p.id === draggingId,
                                    );
                                    const toIndex = positions.findIndex(
                                        (p) => p.id === position.id,
                                    );

                                    if (fromIndex === -1 || toIndex === -1) {
                                        return;
                                    }

                                    const next = reorderArray(
                                        positions,
                                        fromIndex,
                                        toIndex,
                                    );
                                    setPositions(next);
                                    persistOrder(next);
                                }}
                                className="text-sm"
                            >
                                <TableCell className="text-sm">
                                    <span className="inline-flex items-center gap-2">
                                        <GripVerticalIcon className="size-4 text-muted-foreground" />
                                        {index + 1}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm uppercase">
                                    {position.name}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {position.max_vote}
                                </TableCell>
                                <TableCell className="flex gap-2 text-sm">
                                    <span
                                        onClick={() => onEdit(position)}
                                        className="cursor-pointer text-green-500 hover:text-green-700 hover:underline"
                                    >
                                        Edit
                                    </span>
                                    <span
                                        onClick={() => onDelete(position)}
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
    );
}

export default function PositionsIndex({ events, eventId, positionList }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(
        null,
    );

    const handleEditClick = (position: Position) => {
        setSelectedPosition(position);
        setOpenEdit(true);
    };

    const handleDeleteClick = (position: Position) => {
        setSelectedPosition(position);
        setOpenDelete(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Positions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => setOpenCreate(true)}
                    >
                        <PlusIcon />
                        <span className="rounded-sm lg:inline">Position</span>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Select
                            value={String(eventId || '')}
                            onValueChange={(value) => {
                                router.get(
                                    '/positions',
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
                    </div>
                </div>

                <PositionTable
                    key={eventId}
                    eventId={eventId}
                    positions={positionList}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />
            </div>

            {openCreate && (
                <PositionCreateDialog
                    open={openCreate}
                    setOpen={setOpenCreate}
                    events={events}
                    eventId={eventId}
                />
            )}
            {openEdit && selectedPosition && (
                <PositionEditDialog
                    open={openEdit}
                    setOpen={setOpenEdit}
                    position={selectedPosition}
                />
            )}
            {openDelete && selectedPosition && (
                <PositionDeleteDialog
                    open={openDelete}
                    setOpen={setOpenDelete}
                    position={selectedPosition}
                />
            )}
        </AppLayout>
    );
}
