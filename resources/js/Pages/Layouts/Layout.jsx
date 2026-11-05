import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    BookOpen,
    Building2,
    Computer,
    Database,
    Info,
    KeyRound,
    LayoutDashboard,
    LogOut,
    Menu,
    Monitor,
    Moon,
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
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Hardware", href: "/hardwares", icon: Computer },
    { label: "Users", href: "/users", icon: Users },
    { label: "Branches", href: "/branches", icon: Building2 },
    { label: "System Data", href: "/system-data", icon: Database },
];

const secondaryLinks = [
    { label: "Documentation", href: "/documentation", icon: BookOpen },
    { label: "About", href: "/about", icon: Info },
];

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

function NavItem({ label, href, icon: Icon, onNavigate }) {
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
                    <Icon />
                    <span>{label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function Navigation({ onNavigate }) {
    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {mainLinks.map((item) => (
                            <NavItem key={item.href} {...item} onNavigate={onNavigate} />
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
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
                    <div className="ml-auto"><ThemeToggle /></div>
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
