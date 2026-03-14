import { Head, router, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';

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

type VoteForm = {
    votes: Record<string, number[]>;
};

export default function VoterDashboard({
    voter,
    event,
    positions,
    selectedVotes,
}: Props) {
    const { data, setData, post, processing, errors } = useForm<VoteForm>({
        votes: selectedVotes ?? {},
    });

    const selectedCountByPosition = useMemo(() => {
        const counts: Record<string, number> = {};

        for (const positionId of Object.keys(data.votes)) {
            counts[positionId] = data.votes[positionId]?.length ?? 0;
        }

        return counts;
    }, [data.votes]);

    const toggleCandidate = (position: Position, candidateId: number) => {
        const key = String(position.id);
        const current = data.votes[key] ?? [];
        const isSelected = current.includes(candidateId);

        if (position.max_vote === 1) {
            setData('votes', {
                ...data.votes,
                [key]: isSelected ? [] : [candidateId],
            });

            return;
        }

        if (isSelected) {
            setData('votes', {
                ...data.votes,
                [key]: current.filter((id) => id !== candidateId),
            });

            return;
        }

        if (current.length >= position.max_vote) {
            return;
        }

        setData('votes', {
            ...data.votes,
            [key]: [...current, candidateId],
        });
    };

    const submitVote = () => {
        post('/voter/vote', {
            preserveScroll: true,
        });
    };

    return (
        <AuthLayout
            title="Voter dashboard"
            description="You are logged in as a voter"
        >
            <Head title="Voter dashboard" />
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, {voter.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                            Username: {voter.username}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Event: {event?.name ?? '—'}
                        </div>
                    </CardContent>
                </Card>

                {errors.votes && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {errors.votes}
                    </div>
                )}

                <div className="space-y-4">
                    {positions.map((position) => {
                        const key = String(position.id);
                        const selectedCount = selectedCountByPosition[key] ?? 0;

                        return (
                            <Card key={position.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-2">
                                        <span>{position.name}</span>
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {selectedCount}/{position.max_vote}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {position.candidates.map((candidate) => {
                                            const isSelected =
                                                data.votes[key]?.includes(
                                                    candidate.id,
                                                ) ?? false;

                                            return (
                                                <button
                                                    type="button"
                                                    key={candidate.id}
                                                    onClick={() =>
                                                        toggleCandidate(
                                                            position,
                                                            candidate.id,
                                                        )
                                                    }
                                                    className={`flex items-center gap-3 rounded-md border p-3 text-left transition ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                                                >
                                                    <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
                                                        {candidate.photo_url ? (
                                                            <img
                                                                src={
                                                                    candidate.photo_url
                                                                }
                                                                alt={
                                                                    candidate.name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                                                N/A
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">
                                                            {candidate.name}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.post('/voter/logout')}
                    >
                        Logout
                    </Button>
                    <Button onClick={submitVote} disabled={processing}>
                        Submit vote
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}
