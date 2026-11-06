import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    BookOpen,
    Building2,
    ClipboardCheck,
    Bell,
    Database,
    Info,
    KeyRound,
    LayoutDashboard,
    LogOut,
    Monitor,
    Moon,
    Settings2,
    ShieldCheck,
    Sun,
    Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { fadeRise, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const mainLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, iconClass: "text-primary" },
    { label: "Hardware", href: "/hardwares", icon: Monitor, iconClass: "text-sky-600 dark:text-sky-400" },
    { label: "My hardware", href: "/my-hardware", icon: Monitor, iconClass: "text-sky-600 dark:text-sky-400" },
    { label: "Branches", href: "/branches", icon: Building2, iconClass: "text-violet-600 dark:text-violet-400" },
    { label: "System Data", href: "/system-data", icon: Settings2, iconClass: "text-amber-600 dark:text-amber-400" },
];

const secondaryLinks = [
    { label: "Documentation", href: "/documentation", icon: BookOpen, iconClass: "text-rose-600 dark:text-rose-400" },
    { label: "About", href: "/about", icon: Info, iconClass: "text-muted-foreground" },
];

const adminLinks = [
    { label: "Roles & Access", href: "/admin/roles", icon: ShieldCheck, iconClass: "text-red-600 dark:text-red-400" },
    { label: "Users", href: "/admin/users", icon: Users, iconClass: "text-red-600 dark:text-red-400" },
    { label: "Deleted hardware", href: "/admin/deleted-hardware", icon: Monitor, iconClass: "text-red-600 dark:text-red-400" },
];

function Notifications() {
    const notifications = usePage().props.auth?.notifications ?? [];
    return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell />{notifications.length > 0 && <span className="absolute top-0 right-0 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{notifications.length}</span>}</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-80"><DropdownMenuLabel>Notifications</DropdownMenuLabel>{notifications.map((notification) => <DropdownMenuItem key={notification.id} asChild><Link href={notification.url} className="block whitespace-normal"><span className="block font-medium">{notification.title}</span><span className="block text-xs text-muted-foreground">{notification.message} · {notification.created_at}</span></Link></DropdownMenuItem>)}{notifications.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>}</DropdownMenuContent></DropdownMenu>;
}

function BrandMark({ className }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm",
                className
            )}
        >
            A
        </span>
    );
}

function NavItem({ label, href, icon: Icon, iconClass, onNavigate }) {
    const { url } = usePage();
    const pathname = url.split("?")[0];
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                >
                    <Icon className={iconClass} />
                    <span>{label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function Navigation({ onNavigate }) {
    const isSuperadmin = usePage().props.auth?.isSuperadmin;
    const canVerify = usePage().props.auth?.canVerify;

    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {mainLinks.map((item) => (
                            <NavItem key={item.href} {...item} onNavigate={onNavigate} />
                        ))}
                        {canVerify && <NavItem label="Verification" href="/verification" icon={ClipboardCheck} iconClass="text-primary" onNavigate={onNavigate} />}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
            {isSuperadmin && (
                <SidebarGroup>
                    <SidebarGroupLabel>Admin</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {adminLinks.map((item) => (
                                <NavItem key={item.href} {...item} onNavigate={onNavigate} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            )}
            <SidebarGroup>
                <SidebarGroupLabel>Resources</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {secondaryLinks.map((item) => (
                            <NavItem key={item.href} {...item} onNavigate={onNavigate} />
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}

function UserMenu({ onNavigate }) {
    const { setTheme } = useTheme();
    const user = usePage().props.auth?.user;
    const { state } = useSidebar();
    const collapsed = state === "collapsed";

    function handleLogout() {
        router.post("/logout");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {collapsed ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mx-auto"
                        aria-label={`Open user menu for ${user?.name ?? "user"}`}
                    >
                        <span
                            aria-hidden="true"
                            className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                        >
                            {(user?.name ?? "?").trim().charAt(0).toUpperCase()}
                        </span>
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 px-2"
                        aria-label="Open user menu"
                    >
                        <span
                            aria-hidden="true"
                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                        >
                            {(user?.name ?? "?").trim().charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                            {user?.name}
                        </span>
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings/password" onClick={onNavigate}>
                        <KeyRound /> Change password
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                        Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-36">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun /> Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon /> Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Monitor /> System
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOut /> Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function AppSidebar({ onNavigate }) {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="AssetHub">
                            <Link href="/" className="gap-2.5" onClick={onNavigate}>
                                <BrandMark />
                                <span className="font-heading text-xl font-semibold">AssetHub</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <Navigation onNavigate={onNavigate} />
            </SidebarContent>
            <SidebarFooter>
                <UserMenu onNavigate={onNavigate} />
            </SidebarFooter>
            {/* <SidebarRail /> */}
        </Sidebar>
    );
}

export default function Layout({ children }) {
    const { url } = usePage();

    return (
        <SidebarProvider>
            <Head title="AssetHub" />
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
                    <SidebarTrigger aria-label="Toggle sidebar" />
                    <span className="font-heading text-lg font-semibold">AssetHub</span>
                    <div className="ml-auto flex items-center gap-2"><Notifications /><ThemeToggle /></div>
                </header>
                <motion.main
                    key={url.split("?")[0]}
                    variants={fadeRise}
                    initial="hidden"
                    animate="show"
                    transition={spring}
                    className="flex-1 p-4 md:p-8"
                >
                    {children}
                </motion.main>
                <Toaster position="bottom-right" richColors />
            </SidebarInset>
        </SidebarProvider>
    );
}
