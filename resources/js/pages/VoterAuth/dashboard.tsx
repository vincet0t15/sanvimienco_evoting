import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    ChevronRight,
    Loader2,
    User,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Candidate = {
    id: number;
    name: string;
    photo_url: string | null;
};

type Position = {
    id: number;
    name: string;
    max_vote: number;
    candidates: Candidate[];
};

type Props = {
    voter: {
        id: number;
        name: string;
        username: string;
        event_id: number;
    };
    event: {
        id: number;
        name: string;
        start_at: string;
        end_at: string;
    } | null;
    positions: Position[];
    selectedVotes: Record<string, number[]>;
};

export default function VoterDashboard({
    voter,
    event,
    positions,
    selectedVotes,
}: Props) {
    const initialVotes = useMemo(() => {
        const result: Record<number, number[]> = {};

        for (const key of Object.keys(selectedVotes ?? {})) {
            const positionId = Number(key);
            const ids = selectedVotes[key] ?? [];

            if (Number.isFinite(positionId) && ids.length > 0) {
                result[positionId] = ids;
            }
        }

        return result;
    }, [selectedVotes]);

    const [votes, setVotes] = useState<Record<number, number[]>>(initialVotes);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalPositions = useMemo(() => positions.length, [positions.length]);

    const votedPositions = useMemo(() => {
        return Object.keys(votes).filter(
            (key) => (votes[Number(key)] ?? []).length > 0,
        ).length;
    }, [votes]);

    const progressPercentage =
        totalPositions > 0 ? (votedPositions / totalPositions) * 100 : 0;

    const handleVote = (positionId: number, candidateId: number, maxVotes: number) => {
        const currentVotes = votes[positionId] || [];
        const selected = currentVotes.includes(candidateId);

        if (selected) {
            setVotes((prev) => ({
                ...prev,
                [positionId]: currentVotes.filter((id) => id !== candidateId),
            }));

            return;
        }

        if (currentVotes.length >= maxVotes) {
            toast.error(`You can only select ${maxVotes} candidate(s) for this position.`);

            return;
        }

        setVotes((prev) => ({
            ...prev,
            [positionId]: [...currentVotes, candidateId],
        }));
    };

    const isSelected = (positionId: number, candidateId: number) => {
        return (votes[positionId] || []).includes(candidateId);
    };

    const handleSubmit = () => {
        if (votedPositions === 0) {
            toast.error('Please select at least one candidate to submit.');

            return;
        }

        setIsConfirmOpen(true);
    };

    const getVoteSummary = () => {
        const summary: { position: string; candidates: string[] }[] = [];

        positions.forEach((position) => {
            const selectedIds = votes[position.id] || [];

            if (selectedIds.length > 0) {
                const selectedCandidates = position.candidates
                    .filter((c) => selectedIds.includes(c.id))
                    .map((c) => c.name);

                summary.push({
                    position: position.name,
                    candidates: selectedCandidates,
                });
            }
        });

        return summary;
    };

    const confirmSubmit = () => {
        setIsSubmitting(true);

        router.post('/voter/vote', { votes }, {
            preserveScroll: true,
            onSuccess: (response: { props: FlashProps }) => {
                toast.success(response.props.flash?.success);
            },
            onError: (errs) => {
                Object.values(errs).forEach((error) => {
                    toast.error(String(error));
                });
                setIsConfirmOpen(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 text-slate-900">
            <Head title="Vote" />

            <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md">
                <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <div className="rounded-lg bg-emerald-600 p-2 text-white shadow-sm">
                                <AppLogoIcon className="h-6 w-6 fill-current" />
                            </div>
                        </div>
                        <div>
                            <h1 className="hidden text-lg font-bold leading-none text-slate-900 sm:block">
                                {event?.name ?? 'Official Ballot'}
                            </h1>
                            <h1 className="text-lg font-bold leading-none text-slate-900 sm:hidden">
                                Ballot
                            </h1>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                                {votedPositions} of {totalPositions} positions filled
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden w-48 flex-col gap-1.5 md:flex">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full bg-emerald-600 transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={votedPositions === 0}
                            className={cn(
                                'hidden shadow-md transition-all md:flex',
                                votedPositions === totalPositions
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200',
                            )}
                        >
                            {votedPositions === totalPositions ? 'Submit Vote' : 'Review & Submit'}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="h-1 w-full bg-slate-100 md:hidden">
                    <div
                        className="h-full bg-emerald-600 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </header>

            <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600" />

                    <div className="mb-6 flex justify-center border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="hidden h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm sm:flex">
                                <AppLogoIcon className="h-8 w-8 fill-current" />
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-medium text-slate-500">
                                    Voter: {voter.name} ({voter.username})
                                </div>
                                <div className="mt-2 text-2xl font-bold uppercase tracking-widest text-slate-900">
                                    Official Ballot
                                </div>
                                <p className="mt-2 text-slate-500 italic">
                                    Please vote wisely.
                                </p>
                            </div>
                            <div className="w-16 sm:block" />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
                            {event?.name ?? '—'}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            {votedPositions}/{totalPositions} filled
                        </Badge>
                    </div>
                </div>

                {positions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 rounded-full bg-slate-100 p-4">
                            <AlertCircle className="h-10 w-10 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-700">
                            No Candidates
                        </h2>
                        <p className="mt-2 text-slate-500">
                            There are no positions/candidates available for you at this time.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {positions.map((position) => (
                            <section
                                key={position.id}
                                className="relative scroll-mt-24"
                            >
                                <div className="sticky top-16 z-30 mb-6 flex items-center justify-between border-b border-slate-200 bg-slate-50/95 py-3 backdrop-blur">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-1 rounded-full bg-emerald-600" />
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">
                                                {position.name}
                                            </h3>
                                            <p className="text-xs font-medium text-slate-500">
                                                Vote for{' '}
                                                <span className="font-bold text-emerald-600">
                                                    {position.max_vote}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={cn(
                                            'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                                            (votes[position.id] || []).length === position.max_vote
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-200 text-slate-600',
                                        )}
                                    >
                                        {(votes[position.id] || []).length} / {position.max_vote} Selected
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {position.candidates.map((candidate) => {
                                        const selected = isSelected(position.id, candidate.id);

                                        return (
                                            <div
                                                key={candidate.id}
                                                onClick={() =>
                                                    handleVote(
                                                        position.id,
                                                        candidate.id,
                                                        position.max_vote,
                                                    )
                                                }
                                                className={cn(
                                                    'group relative flex cursor-pointer flex-row overflow-hidden rounded-xl border bg-white transition-all duration-200 sm:flex-col',
                                                    selected
                                                        ? 'z-10 border-emerald-500 shadow-lg shadow-emerald-100 ring-1 ring-emerald-500'
                                                        : 'border-slate-200 hover:border-emerald-300 hover:shadow-md',
                                                )}
                                            >
                                                {selected ? (
                                                    <div className="absolute right-2 top-2 z-20 animate-in zoom-in rounded-full bg-emerald-600 p-1 text-white shadow-sm duration-200">
                                                        <Check className="h-3 w-3 stroke-[4]" />
                                                    </div>
                                                ) : null}

                                                <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:w-full sm:aspect-square">
                                                    {candidate.photo_url ? (
                                                        <img
                                                            src={candidate.photo_url}
                                                            alt={candidate.name}
                                                            className={cn(
                                                                'h-full w-full object-cover object-top transition-transform duration-500',
                                                                selected
                                                                    ? 'scale-105'
                                                                    : 'group-hover:scale-105',
                                                            )}
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                                                            <User className="h-10 w-10 sm:h-20 sm:w-20" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-1 flex-col justify-center p-4 sm:justify-start">
                                                    <h4
                                                        className={cn(
                                                            'mb-1 text-base font-bold leading-tight text-slate-900 sm:text-lg',
                                                            selected &&
                                                            'text-emerald-700',
                                                        )}
                                                    >
                                                        {candidate.name}
                                                    </h4>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {position.candidates.length === 0 ? (
                                        <div className="col-span-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
                                            <p className="text-sm text-slate-400">
                                                No candidates available for this position.
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white p-4 pb-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] md:hidden">
                <Button
                    size="lg"
                    className={cn(
                        'h-12 w-full text-lg font-bold shadow-none',
                        votedPositions === totalPositions
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-blue-600 hover:bg-blue-700',
                    )}
                    onClick={handleSubmit}
                    disabled={votedPositions === 0}
                    hidden={isConfirmOpen}
                >
                    {votedPositions === totalPositions ? (
                        <>
                            Submit Vote <Check className="ml-2 h-5 w-5" />
                        </>
                    ) : (
                        <>
                            Review & Submit ({votedPositions}){' '}
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="flex max-h-[90vh] max-w-md flex-col gap-0 overflow-hidden p-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl">
                            Review Your Votes
                        </DialogTitle>
                        <DialogDescription>
                            Please review your selections carefully. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-2">
                        <div className="space-y-6">
                            {getVoteSummary().map((item, idx) => (
                                <div
                                    key={idx}
                                    className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                                >
                                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        {item.position}
                                    </h4>
                                    <div className="space-y-2">
                                        {item.candidates.map((name, cIdx) => (
                                            <div
                                                key={cIdx}
                                                className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 p-2"
                                            >
                                                <div className="rounded-full bg-blue-100 p-1 text-blue-700">
                                                    <User className="h-3 w-3" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">
                                                    {name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {getVoteSummary().length === 0 ? (
                                <p className="py-4 text-center text-slate-500">
                                    No votes selected.
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <DialogFooter className="border-t border-slate-100 bg-slate-50 p-6 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsConfirmOpen(false)}
                            disabled={isSubmitting}
                        >
                            Back to Ballot
                        </Button>
                        <Button
                            onClick={confirmSubmit}
                            disabled={isSubmitting}
                            className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Submit Ballot'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
