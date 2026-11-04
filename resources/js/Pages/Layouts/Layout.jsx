import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    BookOpen,
    Building2,
    Computer,
    Database,
    Info,
    LayoutDashboard,
    LogOut,
    Menu,
    Users,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
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
    const { props, url } = usePage();
    const user = props.auth?.user;

    function handleLogout() {
        router.post("/logout");
    }

    return (
        <div className="min-h-screen bg-background">
            <Head title="AssetHub" />

            <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
                <Link href="/" className="mb-8 px-3 font-heading text-xl font-semibold">
                    AssetHub
                </Link>
                <Navigation />
                <Separator className="my-4" />
                <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate px-2 text-sm font-medium">
                        {user?.name}
                    </span>
                    <ThemeToggle />
                </div>
                <Button variant="ghost" className="mt-2 justify-start" onClick={handleLogout}>
                    <LogOut /> Log out
                </Button>
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
                <Link href="/" className="font-heading text-lg font-semibold">
                    AssetHub
                </Link>
                <div className="ml-auto"><ThemeToggle /></div>
            </header>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-4">
                    <SheetHeader className="mb-4 px-3">
                        <SheetTitle className="text-xl font-semibold">AssetHub</SheetTitle>
                        <SheetDescription className="sr-only">Site navigation</SheetDescription>
                    </SheetHeader>
                    <div className="flex min-h-0 flex-1 flex-col">
                        <Navigation onNavigate={() => setMenuOpen(false)} />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate px-2 text-sm font-medium">
                            {user?.name}
                        </span>
                        <ThemeToggle />
                    </div>
                    <Button variant="ghost" className="mt-2 justify-start" onClick={handleLogout}>
                        <LogOut /> Log out
                    </Button>
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
