import type { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface FilterProps {
    search?: string;
    statusId?: string;
    role?: string;
}

interface MyPageProps extends InertiaPageProps {
    filters: FilterProps;
}
