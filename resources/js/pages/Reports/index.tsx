import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes';
import reports from '@/routes/voter/reports';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react'
import React from 'react'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Reports',
        href: reports.index.url(),
    },
];
export default function index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1>Reports</h1>
            </div>
        </AppLayout>
    )
}


