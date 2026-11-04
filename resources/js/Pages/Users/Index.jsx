import React, { useEffect, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { ChevronDown, Eye, Filter, Plus, Search, Trash2, UsersRound, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fadeRise, listStagger, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MotionRow = motion.create(TableRow);

function UserActions({ user, onDelete }) {
    return (
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" asChild aria-label={`View ${user.user_name}`}>
                        <Link href={`/users/${user.id}`}><Eye /></Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(user)}
                        aria-label={`Delete ${user.user_name}`}
                    >
                        <Trash2 />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}

export default function Index({ users, filters, branches, positions, total }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const latestFilters = useRef(filters);
    const initialSearch = useRef(true);
    const searchDebounceTimeout = useRef(null);
    const hasFilters =
        filters.search !== "" ||
        filters.branch_id !== null ||
        filters.position_id !== null ||
        filters.per_page !== 10;

    const activeFilters = [
        filters.branch_id !== null && {
            key: "branch_id",
            label: branches.find((branch) => branch.id === filters.branch_id)?.branch_name ?? "Branch",
        },
        filters.position_id !== null && {
            key: "position_id",
            label: positions.find((position) => position.id === filters.position_id)?.position_name ?? "Position",
        },
    ].filter(Boolean);

    useEffect(() => setSearch(filters.search ?? ""), [filters.search]);
    useEffect(() => { latestFilters.current = filters; }, [filters]);
    useEffect(() => {
        if (initialSearch.current) {
            initialSearch.current = false;
            return;
        }
        searchDebounceTimeout.current = setTimeout(() => {
            applyFilters({ ...latestFilters.current, search });
        }, 300);
        return () => clearTimeout(searchDebounceTimeout.current);
    }, [search]);
    useEffect(() => () => {
        if (searchDebounceTimeout.current) clearTimeout(searchDebounceTimeout.current);
    }, []);

    const applyFilters = (values) => {
        const params = {};
        if (values.search.trim() !== "") params.search = values.search.trim();
        if (values.branch_id) params.branch_id = values.branch_id;
        if (values.position_id) params.position_id = values.position_id;
        if (Number(values.per_page) !== 10) params.per_page = values.per_page;
        router.get("/users", params, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleSelect = (key, value) => {
        applyFilters({
            ...latestFilters.current,
            search,
            [key]: value === "none" ? null : key === "per_page" ? Number(value) : value,
        });
    };

    const removeFilter = (key) => handleSelect(key, "none");

    const removeSearch = () => {
        setSearch("");
        applyFilters({ ...latestFilters.current, search: "" });
    };

    const clearFilters = () => {
        setSearch("");
        router.get("/users", {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const filterSelect = (key, value, placeholder, options, allLabel) => (
        <Select value={value == null ? "none" : String(value)} onValueChange={(next) => handleSelect(key, next)}>
            <SelectTrigger className="w-full" aria-label={placeholder}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {allLabel && <SelectItem value="none">{allLabel}</SelectItem>}
                {options.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    function confirmDelete(event) {
        event.preventDefault();
        if (!selectedUser) return;
        setDeleting(true);
        router.delete(`/users/${selectedUser.id}`, {
            onSuccess: () => {
                toast.success("User deleted successfully!");
                setSelectedUser(null);
                setDeleteError("");
            },
            onError: (errors) => setDeleteError(errors.delete ?? "Failed to delete user. Please try again."),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <Layout>
            <TooltipProvider>
                <PageHeader
                    icon={ UsersRound }
                    title="Users"
                    description="Manage assigned hardware users."
                />

                <div className="mb-5 rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="relative w-full">
                            <Search className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search user, position, branch…"
                                aria-label="Search users"
                                className="pl-8"
                            />
                        </div>
                        <Button asChild className="shrink-0 sm:ml-auto">
                            <Link href="/users/create"><Plus /> Add user</Link>
                        </Button>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFiltersOpen((open) => !open)}
                            aria-expanded={filtersOpen}
                            aria-controls="user-filters"
                            className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <Filter />
                            Filters
                            {activeFilters.length > 0 && (
                                <Badge variant="secondary" className="rounded-full px-1.5">{activeFilters.length}</Badge>
                            )}
                            <ChevronDown className={cn("size-4 transition-transform", filtersOpen && "rotate-180")} aria-hidden="true" />
                        </Button>

                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm text-muted-foreground" aria-live="polite">
                                {total} {total === 1 ? "user" : "users"}
                            </p>
                            {filters.search !== "" && (
                                <Badge variant="secondary" className="gap-1 font-normal">
                                    <span className="max-w-40 truncate">Search: {filters.search}</span>
                                    <button
                                        type="button"
                                        onClick={removeSearch}
                                        aria-label={`Clear search ${filters.search}`}
                                        className="rounded-full hover:bg-foreground/10"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            )}
                            {activeFilters.map((filter) => (
                                <Badge key={filter.key} variant="secondary" className="gap-1 font-normal">
                                    {filter.label}
                                    <button
                                        type="button"
                                        onClick={() => removeFilter(filter.key)}
                                        aria-label={`Remove filter ${filter.label}`}
                                        className="rounded-full hover:bg-foreground/10"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {filtersOpen && (
                        <div id="user-filters" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {filterSelect("branch_id", filters.branch_id, "All branches", branches.map((branch) => ({ value: branch.id, label: branch.branch_name })), "All branches")}
                            {filterSelect("position_id", filters.position_id, "All positions", positions.map((position) => ({ value: position.id, label: position.position_name })), "All positions")}
                            <div className="flex items-center">
                                {hasFilters && <Button variant="ghost" onClick={clearFilters}>Clear all</Button>}
                            </div>
                        </div>
                    )}
                </div>

                {users.data.length > 0 ? (
                    <>
                        <div className="hidden rounded-xl border border-border bg-card md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence initial={false}>
                                        {users.data.map((user, index) => (
                                            <MotionRow
                                                key={user.id}
                                                layout
                                                variants={fadeRise}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                            >
                                                <TableCell><Link href={`/users/${user.id}`} className="font-medium hover:underline">{user.user_name}</Link></TableCell>
                                                <TableCell>{user.user_position?.position_name || "N/A"}</TableCell>
                                                <TableCell>{user.branch?.branch_name || "N/A"}</TableCell>
                                                <TableCell><UserActions user={user} onDelete={setSelectedUser} /></TableCell>
                                            </MotionRow>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="space-y-3 md:hidden">
                            <AnimatePresence initial={false}>
                                {users.data.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        layout
                                        variants={fadeRise}
                                        initial="hidden"
                                        animate="show"
                                        exit="hidden"
                                        transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                    >
                                        <Card size="sm">
                                            <CardContent className="space-y-3">
                                                <div>
                                                    <Link href={`/users/${user.id}`} className="font-medium hover:underline">{user.user_name}</Link>
                                                    <p className="mt-1 text-sm text-muted-foreground">{user.user_position?.position_name || "N/A"}</p>
                                                    <p className="text-sm text-muted-foreground">{user.branch?.branch_name || "N/A"}</p>
                                                </div>
                                                <UserActions user={user} onDelete={setSelectedUser} />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Show</span>
                                <Select
                                    value={String(filters.per_page ?? 10)}
                                    onValueChange={(next) => handleSelect("per_page", next)}
                                >
                                    <SelectTrigger className="w-28" aria-label="Rows per page">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 25, 50].map((size) => (
                                            <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <nav className="flex flex-wrap justify-end gap-1" aria-label="Pagination">
                                {users.links?.map((link, index) => (
                                    link.url ? (
                                        <Button key={index} variant={link.active ? "default" : "outline"} size="sm" asChild>
                                            <Link href={link.url} preserveScroll preserveState dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    ) : (
                                        <span
                                            key={index}
                                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none opacity-50")}
                                            aria-disabled="true"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </nav>
                        </div>
                    </>
                ) : (
                    <Card className="items-center py-10 text-center">
                        <CardContent>
                            <p className="font-heading text-lg">{hasFilters ? "No users match these filters." : "No user data exists."}</p>
                            <Button className="mt-4" onClick={hasFilters ? clearFilters : undefined} asChild={!hasFilters}>
                                {hasFilters ? "Clear" : <Link href="/users/create">Add user</Link>}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </TooltipProvider>

            <AlertDialog
                open={Boolean(selectedUser)}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setSelectedUser(null);
                        setDeleteError("");
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedUser?.user_name}?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the assigned user.</AlertDialogDescription>
                    </AlertDialogHeader>
                    {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
}
