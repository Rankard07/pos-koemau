import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    BookOpen,
    FolderGit2,
    FolderGit,
    Package,
    Truck,
    ArrowUpCircle,
    ArrowDownCircle,
    ShoppingCart,
    /* Settings,
    HelpCircle, */
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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
import type { NavItem } from '@/types';
import { route } from 'ziggy-js';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'), //dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Produk',
        href: route('products.index'),
        icon: Package,
    },
    {
        title: 'Supply',
        href: route('supply.index'),
        icon: Truck,
    },
    {
        title: 'Pengeluaran',
        href: route('expenses.index'),
        icon: ArrowDownCircle,
    },
    {
        title: 'Pemasukan',
        href: route('income.index'),
        icon: ArrowUpCircle,
    },
    {
        title: 'Penjualan',
        href: route('sales.index'),
        icon: ShoppingCart,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/Rankard07/pos-koemau',
        icon: FolderGit2,
    },
    {
        title: 'Laravel Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
