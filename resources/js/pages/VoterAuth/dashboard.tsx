import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

type Props = {
    voter: {
        id: number;
        name: string;
        username: string;
        event_id: number;
    };
};

export default function VoterDashboard({ voter }: Props) {
    return (
        <AuthLayout
            title="Voter dashboard"
            description="You are logged in as a voter"
        >
            <Head title="Voter dashboard" />
            <div className="space-y-4">
                <div className="rounded-md border p-4">
                    <div className="text-lg font-semibold">
                        Welcome, {voter.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Username: {voter.username}
                    </div>
                </div>

                <div>
                    <Button
                        variant="outline"
                        onClick={() => router.post('/voter/logout')}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}
