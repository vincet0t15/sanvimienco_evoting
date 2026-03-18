type EventPayload = {
    id: number;
    name: string;
    is_active: boolean;
    start_at: string | null;
    end_at: string | null;
};

type StatsPayload = {
    total_voters: number;
    votes_cast: number;
    turnout_percentage: number;
    did_not_vote: number;
};

type CandidatePayload = {
    id: number;
    name: string;
    photo_url: string | null;
    votes_count: number;
    percent?: number;
};

type PositionPayload = {
    id: number;
    name: string;
    max_vote: number;
    total_votes: number;
    abstentions: number;
    candidates: CandidatePayload[];
};

type Props = {
    event: EventPayload;
    stats: StatsPayload;
    positions: PositionPayload[];
};

export default function PrintOfficialReport({ event, stats, positions }: Props) {
    const formatElectionDate = (dateString: string | null) => {
        if (!dateString) {
            return '';
        }

        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatNumber = (value: number) => {
        return value.toLocaleString();
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
                                <div className="mb-5 text-center">
                                    <h2
                                        className="m-0 text-[16px] font-bold uppercase"
                                        style={{
                                            fontFamily:
                                                '"Old English Text MT", "Times New Roman", serif',
                                        }}
                                    >
                                        OFFICIAL ELECTION REPORT
                                    </h2>
                                    <p className="m-[5px_0] text-[12px]">
                                        {event.name}
                                    </p>
                                    <p className="m-0 text-[12px]">
                                        Date of Election:{' '}
                                        {formatElectionDate(event.start_at)}
                                    </p>
                                </div>

                                <table className="mb-6 w-full border-collapse border border-black">
                                    <tbody>
                                        <tr>
                                            <td className="border border-black p-2 font-bold">
                                                Total Voters
                                            </td>
                                            <td className="border border-black p-2 text-right">
                                                {formatNumber(
                                                    stats.total_voters,
                                                )}
                                            </td>
                                            <td className="border border-black p-2 font-bold">
                                                Votes Cast
                                            </td>
                                            <td className="border border-black p-2 text-right">
                                                {formatNumber(stats.votes_cast)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-2 font-bold">
                                                Turnout
                                            </td>
                                            <td className="border border-black p-2 text-right">
                                                {stats.turnout_percentage}%
                                            </td>
                                            <td className="border border-black p-2 font-bold">
                                                Did Not Vote
                                            </td>
                                            <td className="border border-black p-2 text-right">
                                                {formatNumber(
                                                    stats.did_not_vote,
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="space-y-6">
                                    {positions.map((position) => (
                                        <div
                                            key={position.id}
                                            className="break-inside-avoid"
                                        >
                                            <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-black pb-1">
                                                <h3 className="m-0 text-[13px] font-bold uppercase">
                                                    {position.name}
                                                </h3>
                                                <div className="text-[11px]">
                                                    Max Vote:{' '}
                                                    {formatNumber(
                                                        position.max_vote,
                                                    )}{' '}
                                                    • Total Votes:{' '}
                                                    {formatNumber(
                                                        position.total_votes,
                                                    )}{' '}
                                                    • Abstentions:{' '}
                                                    {formatNumber(
                                                        position.abstentions,
                                                    )}
                                                </div>
                                            </div>

                                            <table className="w-full border-collapse border border-black">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="w-10 border border-black px-2 py-1 text-left">
                                                            #
                                                        </th>
                                                        <th className="border border-black px-2 py-1 text-left">
                                                            Candidate
                                                        </th>
                                                        <th className="w-20 border border-black px-2 py-1 text-right">
                                                            Votes
                                                        </th>
                                                        <th className="w-20 border border-black px-2 py-1 text-right">
                                                            %
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {position.candidates.length ===
                                                        0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan={4}
                                                                className="border border-black px-2 py-2 text-center italic"
                                                            >
                                                                No candidates
                                                                found.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        position.candidates.map(
                                                            (candidate, idx) => (
                                                                <tr
                                                                    key={
                                                                        candidate.id
                                                                    }
                                                                >
                                                                    <td className="border border-black px-2 py-1">
                                                                        {idx + 1}
                                                                    </td>
                                                                    <td className="border border-black px-2 py-1 uppercase">
                                                                        {
                                                                            candidate.name
                                                                        }
                                                                    </td>
                                                                    <td className="border border-black px-2 py-1 text-right">
                                                                        {formatNumber(
                                                                            candidate.votes_count,
                                                                        )}
                                                                    </td>
                                                                    <td className="border border-black px-2 py-1 text-right">
                                                                        {candidate.percent ??
                                                                            0}
                                                                        %
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
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

                    td, th {
                        padding: 4px 6px !important;
                        font-size: 12px;
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
}
