import { Voter } from '@/types';
import { Event } from '@/types/event';
import { PaginatedDataResponse } from '@/types/pagination';
import { formatDate } from 'date-fns';
import React from 'react'
interface Props {
    event: Event;
    voters: PaginatedDataResponse<Voter>
}
function printAuditLogs({ event, voters }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    return (
        <div className="mx-auto min-h-screen max-w-[216mm] bg-white p-8 font-sans text-[11px] leading-[1.3] text-black print:p-0">
            <div className="print:w-full">
                <table className="w-full">
                    <thead className="hidden print:table-header-group">
                        <tr>
                            <td>
                                <div className="h-[9mm]"></div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {/* <div className="mb-6 flex justify-center border-b-2 border-black pb-2">
                                    <table className="border-collapse border-none">
                                        <tbody>
                                            <tr>
                                                <td className="border-none !p-0 pr-4 align-top">
                                                    {system_settings.logo ? (
                                                        <img
                                                            src={
                                                                system_settings.logo
                                                            }
                                                            alt="Logo"
                                                            className="h-20 w-auto object-contain"
                                                            onError={(e) => {
                                                                const target =
                                                                    e.target as HTMLImageElement;
                                                                if (
                                                                    target.src !==
                                                                    system_settings.logo
                                                                ) {
                                                                    target.src =
                                                                        system_settings.logo ||
                                                                        '';
                                                                } else {
                                                                    target.style.display =
                                                                        'none';
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white">
                                                            <AppLogoIcon className="h-10 w-10 fill-current" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="border-none !p-0 text-center align-middle">
                                                    <div
                                                        className="font-serif text-[13px]"
                                                        style={{
                                                            fontFamily:
                                                                '"Old English Text MT", "Times New Roman", serif',
                                                        }}
                                                    >
                                                        REPUBLIC OF THE
                                                        PHILIPPINES
                                                    </div>
                                                    <div
                                                        className="font-serif text-[13px]"
                                                        style={{
                                                            fontFamily:
                                                                '"Old English Text MT", "Times New Roman", serif',
                                                        }}
                                                    >
                                                        DEPARTMENT OF EDUCATION
                                                    </div>
                                                    <div
                                                        className="font-serif text-[13px]"
                                                        style={{
                                                            fontFamily:
                                                                '"Times New Roman", serif',
                                                        }}
                                                    >
                                                        MIMAROPA Region
                                                    </div>
                                                    <div
                                                        className="font-serif text-[13px]"
                                                        style={{
                                                            fontFamily:
                                                                '"Times New Roman", serif',
                                                        }}
                                                    >
                                                        Schools Division of
                                                        Palawan
                                                    </div>
                                                    <div
                                                        className="my-1 font-serif text-[16px] font-bold text-[#006400] uppercase"
                                                        style={{
                                                            fontFamily:
                                                                '"Times New Roman", serif',
                                                        }}
                                                    >
                                                        {system_settings?.name ||
                                                            'SAN VICENTE NATIONAL HIGH SCHOOL'}
                                                    </div>
                                                    <div
                                                        className="font-serif text-[12px] italic"
                                                        style={{
                                                            fontFamily:
                                                                '"Times New Roman", serif',
                                                        }}
                                                    >
                                                        Poblacion, San Vicente,
                                                        Palawan
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div> */}

                                <div className="mb-5 text-center">
                                    <h2
                                        className="m-0 text-[16px] font-bold uppercase"
                                        style={{
                                            fontFamily:
                                                '"Old English Text MT", "Times New Roman", serif',
                                        }}
                                    >
                                        OFFICIAL AUDIT LOG REPORT
                                    </h2>
                                    <p className="m-[5px_0] text-[12px]">
                                        {event.name}
                                    </p>
                                    <p className="m-0 text-[12px]">
                                        Date of Election:{' '}
                                        {formatDate(event.start_at)}
                                    </p>
                                </div>

                                <table className="mb-5 w-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="p-1 font-bold">
                                                Total Records:{' '}
                                                {voters.total.toLocaleString()}
                                            </td>
                                            <td className="p-1 font-bold"></td>
                                            <td className="p-1 font-bold"></td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="mb-8">
                                    <table className="-mt-[1px] w-full table-fixed border-collapse border border-black">
                                        <thead>
                                            <tr className="bg-gray-100">

                                                <th className="border border-black px-2 py-1 text-left">
                                                    Voter Name
                                                </th>
                                                <th className="w-24 border border-black px-2 py-1 text-left">
                                                    Voter ID
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {voters.data.map((voter) => (
                                                <tr key={voter.id}>

                                                    <td className="border border-black px-2 py-1 uppercase">
                                                        {voter.name}
                                                    </td>
                                                    <td className="border border-black px-2 py-1 font-mono">
                                                        {voter.username}
                                                    </td>


                                                </tr>
                                            ))}
                                            {voters.data.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="border border-black px-2 py-4 text-center italic"
                                                    >
                                                        No voting activity
                                                        recorded.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>


                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { margin: 0 10mm; -webkit-print-color-adjust: exact; }
                    table {
                        border-collapse: collapse;
                    }

                    td {
                        padding: 4px 6px !important;
                        font-size: 12px;
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>

    )
}

export default printAuditLogs