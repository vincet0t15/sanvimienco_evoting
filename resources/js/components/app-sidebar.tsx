import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    LayoutGrid,
    ListOrdered,
    Printer,
    Trophy,
    UserCog,
    UserRound,
    Users,
} from 'lucide-react';
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
import reports from '@/routes/reports';
import results from '@/routes/results';
import users from '@/routes/users';
import voters from '@/routes/voters';
import type { NavGroup } from '@/types';

const mainNavItems: NavGroup[] = [
    {
        title: 'Overview',
        children: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Election',
        children: [
            {
                title: 'Events',
                href: events.index.url(),
                icon: CalendarDays,
            },
            {
                title: 'Results',
                href: results.index.url(),
                icon: Trophy,
            },
            {
                title: 'Positions',
                href: positions.index.url(),
                icon: ListOrdered,
            },
            {
                title: 'Candidates',
                href: candidates.index.url(),
                icon: UserRound,
            },
        ],
    },
    {
        title: 'Voters',
        children: [
            {
                title: 'Voters',
                href: voters.index.url(),
                icon: Users,
            },
            {
                title: 'Print slips',
                href: voters.print.url(),
                icon: Printer,
            },
        ],
    },
    {
        title: 'Administration',
        children: [
            {
                title: 'Users',
                href: users.index.url(),
                icon: UserCog,
            },
            {
                title: 'Reports',
                href: reports.index.url(),
                icon: UserCog,
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
