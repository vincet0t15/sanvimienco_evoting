import { Link } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import candidates from '@/routes/candidates';
import events from '@/routes/events';
import positions from '@/routes/positions';
import voters from '@/routes/voters';
import type { NavGroup } from '@/types';

const mainNavItems: NavGroup[] = [
    {
        title: 'General',
        children: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Settings',
        children: [
            {
                title: 'Events',
                href: events.index.url(),
                icon: LayoutGrid,
            },
            {
                title: 'Positions',
                href: positions.index.url(),
                icon: LayoutGrid,
            },
            {
                title: 'Candidates',
                href: candidates.index.url(),
                icon: LayoutGrid,
            },
            {
                title: 'Voters',
                href: voters.index.url(),
                icon: LayoutGrid,
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
