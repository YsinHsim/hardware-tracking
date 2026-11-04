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
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { fadeRise, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

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

function UserMenu({ onNavigate }) {
    const { setTheme } = useTheme();
    const user = usePage().props.auth?.user;

    function handleLogout() {
        router.post("/logout");
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
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

function Navigation({ onNavigate }) {
    const { url } = usePage();
    const pathname = url.split("?")[0];
    const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
    const renderLink = ({ label, href, icon: Icon }) => (
        <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive(href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground"
            )}
            aria-current={isActive(href) ? "page" : undefined}
        >
            <Icon className="size-4" />
            {label}
        </Link>
    );

    return (
        <>
            <nav className="space-y-1" aria-label="Main navigation">
                {mainLinks.map(renderLink)}
            </nav>
            <nav className="mt-auto space-y-1" aria-label="Secondary navigation">
                {secondaryLinks.map(renderLink)}
            </nav>
        </>
    );
}

export default function Layout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-background">
            <Head title="AssetHub" />

            <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
                <Link href="/" className="mb-8 flex items-center gap-2.5 px-3 font-heading text-xl font-semibold">
                    <BrandMark />
                    AssetHub
                </Link>
                <Navigation />
                <Separator className="my-4" />
                <UserMenu />
            </aside>

            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open navigation"
                >
                    <Menu />
                </Button>
                <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
                    <BrandMark className="size-7" />
                    AssetHub
                </Link>
                <div className="ml-auto"><ThemeToggle /></div>
            </header>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-4">
                    <SheetHeader className="mb-4 px-3">
                        <SheetTitle className="flex items-center gap-2 text-xl font-semibold">
                            <BrandMark className="size-7" />
                            AssetHub
                        </SheetTitle>
                        <SheetDescription className="sr-only">Site navigation</SheetDescription>
                    </SheetHeader>
                    <div className="flex min-h-0 flex-1 flex-col">
                        <Navigation onNavigate={() => setMenuOpen(false)} />
                    </div>
                    <Separator className="my-4" />
                    <UserMenu onNavigate={() => setMenuOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="md:pl-60">
                <motion.main
                    key={url.split("?")[0]}
                    variants={fadeRise}
                    initial="hidden"
                    animate="show"
                    transition={spring}
                    className="p-4 md:p-8"
                >
                    {children}
                </motion.main>
            </div>
            <Toaster position="bottom-right" richColors />
        </div>
    );
}
