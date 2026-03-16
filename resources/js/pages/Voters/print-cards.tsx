import { Head, usePage } from '@inertiajs/react';
import { Scissors } from 'lucide-react';
import type { ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import events from '@/routes/events';
import { Event } from '@/types/event';

type VoterRow = {
    id: number;
    name: string;
    username: string;
    event?: {
        id: number;
        name: string;
    } | null;
};

type Props = {
    event: Event
    voters: VoterRow[];
    filters: {
        search?: string | null;
        event_id?: number | null;
    };
};

export default function PrintCards({ voters, filters, event }: Props) {
    console.log(event)
    const printSlips = () => window.print();

    const subtitleParts: ReactNode[] = [];

    if (filters.event_id) {
        subtitleParts.push(
            <span key="event" className="font-medium text-emerald-600">
                Event ID: {filters.event_id}
            </span>,
        );
    }

    if (filters.search) {
        subtitleParts.push(
            <span key="search" className="font-medium text-slate-700">
                Search: {filters.search}
            </span>,
        );
    }

    return (
        <div className="mx-auto min-h-screen max-w-[297mm] bg-white p-8 font-sans text-black print:max-w-none print:p-0">
            <Head title="Print Voter Slips" />

            <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b pb-4 print:hidden sm:flex-row">
                <div>
                    <h1 className="mb-1 text-2xl font-bold">
                        Voter Credential Slips
                    </h1>
                    <p className="text-sm text-gray-500">
                        Printing {voters.length} slips.
                        <span className="mt-1 block font-medium text-emerald-600">
                            Tip: Use &quot;Landscape&quot; orientation for best
                            fit.
                        </span>
                        {subtitleParts.length > 0 ? (
                            <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                {subtitleParts}
                            </span>
                        ) : null}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={printSlips}
                    className="flex items-center gap-2 rounded bg-emerald-600 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 6 2 18 2 18 9" />
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print Slips
                </button>
            </div>

            <div className="grid grid-cols-5 gap-0 border-l border-t border-gray-300 print:w-full">
                {voters.map((voter) => (
                    <div
                        key={voter.id}
                        className="page-break-inside-avoid relative flex h-[30mm] flex-col justify-between break-inside-avoid border-b border-r border-gray-300 p-3"
                    >
                        <div className="absolute right-0 top-0 p-1 opacity-20 print:opacity-10">
                            <Scissors size={10} />
                        </div>

                        <div className="mb-2 flex items-start gap-2">
                            <div className="overflow-hidden pt-0.5 leading-none">
                                <h3 className="w-full truncate text-[10px] font-bold uppercase mb-1">
                                    {event.name || 'Voting System'}
                                </h3>
                                <p className="text-[9px] font-medium uppercase text-gray-500">
                                    Voter Credential
                                </p>

                            </div>
                        </div>

                        <div className="flex-1 space-y-1.5 text-[11px]">
                            <div>
                                <div className="text-[9px] uppercase tracking-wider text-gray-500">
                                    Name
                                </div>
                                <div className="truncate font-bold uppercase leading-tight">
                                    {voter.name}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-900">
                                        Username
                                    </div>
                                    <div className="inline-block rounded bg-gray-50 px-1 font-mono font-bold">
                                        {voter.username}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] uppercase tracking-wider text-gray-900">
                                        Password
                                    </div>
                                    <div className="inline-block rounded bg-gray-50 px-1 font-mono font-bold">
                                        {voter.username}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 1mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                    }
                    .page-break-inside-avoid {
                        break-inside: avoid;
                        page-break-after: auto;
                    }
                }
            `}</style>
        </div>
    );
}
