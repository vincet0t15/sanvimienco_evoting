import { Head, router, useForm } from '@inertiajs/react';
import { SearchIcon, ShieldCheckIcon, UserCogIcon, XIcon } from 'lucide-react';
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
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type { FilterProps } from '@/types/filter';
import type { PaginatedDataResponse } from '@/types/pagination';

type AdminUser = {
    id: number;
    name: string;
    username: string | null;
    is_active: boolean;
    created_at: string;
};

type Props = {
    userList: PaginatedDataResponse<AdminUser>;
    filters: FilterProps;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Users',
        href: '/users',
    },
];

export default function UsersIndex({ userList, filters }: Props) {
    const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});
    const { data, setData } = useForm({
        search: filters.search || '',
    });

    const activeCount = useMemo(() => {
        return userList.data.reduce(
            (acc, user) => acc + (user.is_active ? 1 : 0),
            0,
        );
    }, [userList.data]);

    const inactiveCount = useMemo(() => {
        return userList.data.length - activeCount;
    }, [activeCount, userList.data.length]);

    const applySearch = () => {
        const queryString = data.search ? { search: data.search } : undefined;

        router.get('/users', queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearSearch = () => {
        setData('search', '');
        router.get('/users', undefined, {
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

    const toggleActive = (userId: number, nextActive: boolean) => {
        setUpdatingIds((prev) => ({ ...prev, [userId]: true }));
        router.patch(
            `/users/${userId}/active`,
            { is_active: nextActive },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () =>
                    setUpdatingIds((prev) => ({ ...prev, [userId]: false })),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="text-xl font-semibold tracking-tight">
                            Users
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Manage admin accounts and access.
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {userList.total}
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
                                {userList.data.length}
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
                                    Name
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    Username
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    Status
                                </TableHead>
                                <TableHead className="font-bold text-primary">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userList.data.length > 0 ? (
                                userList.data.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="text-sm hover:bg-muted/30"
                                    >
                                        <TableCell className="text-sm">
                                            {user.name}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {user.username ?? (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {user.is_active ? (
                                                <Badge className="border-none bg-emerald-600 text-white hover:bg-emerald-700">
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
                                            {user.is_active ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        updatingIds[user.id] ===
                                                        true
                                                    }
                                                    onClick={() =>
                                                        toggleActive(
                                                            user.id,
                                                            false,
                                                        )
                                                    }
                                                >
                                                    <ShieldCheckIcon className="size-4" />
                                                    Deactivate
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    disabled={
                                                        updatingIds[user.id] ===
                                                        true
                                                    }
                                                    onClick={() =>
                                                        toggleActive(
                                                            user.id,
                                                            true,
                                                        )
                                                    }
                                                >
                                                    <UserCogIcon className="size-4" />
                                                    Activate
                                                </Button>
                                            )}
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
                    <Pagination data={userList} />
                </div>
            </div>
        </AppLayout>
    );
}

