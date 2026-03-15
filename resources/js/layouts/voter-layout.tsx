import { Link } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';
import { Toaster } from 'sonner';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';

type Props = PropsWithChildren<{
    title: string;
    right?: ReactNode;
}>;

export default function VoterLayout({ title, right, children }: Props) {
    return (
        <div className="min-h-svh bg-background">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={home()}
                            className="flex items-center gap-2 font-medium"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-md">
                                <AppLogoIcon className="size-8 fill-current text-[var(--foreground)] dark:text-white" />
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {title}
                            </span>
                        </Link>
                    </div>
                    {right ? <div className="shrink-0">{right}</div> : null}
                </div>
            </div>

            <main className="mx-auto w-full max-w-6xl px-4 py-6">
                {children}
            </main>

            <Toaster richColors position="top-right" />
        </div>
    );
}
