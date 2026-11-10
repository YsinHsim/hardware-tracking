import React, { useEffect, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { ChevronDown, Eye, Filter, HardDrive, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import HardwareStatusBadge from "@/components/HardwareStatusBadge";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fadeRise, listStagger, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MotionRow = motion.create(TableRow);

function HardwareActions({ hardware, onDelete }) {
    return (
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" asChild aria-label={`View ${hardware.hardware_no}`}>
                        <Link href={`/hardwares/${hardware.id}`}><Eye /></Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" asChild aria-label={`Edit ${hardware.hardware_no}`}>
                        <Link href={`/hardwares/${hardware.id}/edit`}><Pencil /></Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(hardware)}
                        aria-label={`Delete ${hardware.hardware_no}`}
                    >
                        <Trash2 />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}

export default function Index({ hardwares, filters, branches, hardwareTypes, hardwareStatuses, total }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedHardware, setSelectedHardware] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const latestFilters = useRef(filters);
    const initialSearch = useRef(true);
    const searchDebounceTimeout = useRef(null);
    const hasFilters =
        filters.search !== "" ||
        filters.branch_id !== null ||
        filters.hardware_type_id !== null ||
        filters.hardware_status_id !== null ||
        filters.verification_status !== null ||
        filters.per_page !== 10;

    const activeFilters = [
        filters.branch_id !== null && {
            key: "branch_id",
            label: filters.branch_id === "unassigned"
                ? "Unassigned"
                : branches.find((branch) => branch.id === filters.branch_id)?.branch_name ?? "Branch",
        },
        filters.hardware_type_id !== null && {
            key: "hardware_type_id",
            label: hardwareTypes.find((type) => type.id === filters.hardware_type_id)?.hardware_type_name ?? "Type",
        },
        filters.hardware_status_id !== null && {
            key: "hardware_status_id",
            label: hardwareStatuses.find((status) => status.id === filters.hardware_status_id)?.hardware_status_name ?? "Status",
        },
        filters.verification_status !== null && {
            key: "verification_status",
            label: `Verification: ${filters.verification_status.replace('_', ' ')}`,
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
        if (values.hardware_type_id) params.hardware_type_id = values.hardware_type_id;
        if (values.hardware_status_id) params.hardware_status_id = values.hardware_status_id;
        if (values.verification_status) params.verification_status = values.verification_status;
        if (Number(values.per_page) !== 10) params.per_page = values.per_page;
        router.get("/hardwares", params, { preserveState: true, preserveScroll: true, replace: true });
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
        router.get("/hardwares", {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const confirmDelete = (event) => {
        event.preventDefault();
        if (!selectedHardware) return;
        setDeleting(true);
        router.delete(`/hardwares/${selectedHardware.id}`, {
            onSuccess: () => {
                toast.success("Hardware deleted");
                setSelectedHardware(null);
                setDeleteError("");
            },
            onError: (errors) => setDeleteError(errors.delete ?? "Failed to delete hardware. Please try again."),
            onFinish: () => setDeleting(false),
        });
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

    return (
        <Layout>
            <TooltipProvider>
                <PageHeader
                    icon={ HardDrive }
                    title="Hardware"
                    description="Track devices, assignments, condition and location."
                />

                <div className="mb-5 rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="relative w-full">
                            <Search className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search tag, serial, user, branch, type…"
                                aria-label="Search hardware"
                                className="pl-8"
                            />
                        </div>
                        <Button asChild className="shrink-0 sm:ml-auto">
                            <Link href="/hardwares/create"><Plus /> Add hardware</Link>
                        </Button>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFiltersOpen((open) => !open)}
                            aria-expanded={filtersOpen}
                            aria-controls="hardware-filters"
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
                                {total} {total === 1 ? "item" : "items"}
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
                        <div id="hardware-filters" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            {filterSelect("branch_id", filters.branch_id, "All branches", [
                                { value: "unassigned", label: "Unassigned" },
                                ...branches.map((branch) => ({ value: branch.id, label: branch.branch_name })),
                            ], "All branches")}
                            {filterSelect("hardware_type_id", filters.hardware_type_id, "All types", hardwareTypes.map((type) => ({ value: type.id, label: type.hardware_type_name })), "All types")}
                            {filterSelect("hardware_status_id", filters.hardware_status_id, "All statuses", hardwareStatuses.map((status) => ({ value: status.id, label: status.hardware_status_name })), "All statuses")}
                            {filterSelect("verification_status", filters.verification_status, "All verification states", ['pending', 'verified', 'changes_requested', 'rejected'].map((status) => ({ value: status, label: status.replace('_', ' ') })), "All verification states")}
                            <div className="flex items-center">
                                {hasFilters && <Button variant="ghost" onClick={clearFilters}>Clear all</Button>}
                            </div>
                        </div>
                    )}
                </div>

                {hardwares.data.length > 0 ? (                    <>
                        <div className="hidden rounded-xl border border-border bg-card md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tag</TableHead>
                                        <TableHead>Assigned to</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Verification</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence initial={false}>
                                        {hardwares.data.map((hardware, index) => (
                                            <MotionRow
                                                key={hardware.id}
                                                layout
                                                variants={fadeRise}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                            >
                                                <TableCell>
                                                    <Link href={`/hardwares/${hardware.id}`} className="font-mono font-medium hover:underline">{hardware.hardware_no}</Link>
                                                    <div className="mt-1 font-mono text-xs text-muted-foreground">{hardware.hardware_serial_no}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {hardware.assigned_user?.user_name || <span className="text-muted-foreground">Unassigned</span>}
                                                </TableCell>
                                                <TableCell>{hardware.hardware_type?.hardware_type_name || "Unknown Type"}</TableCell>
                                                <TableCell><HardwareStatusBadge status={hardware.hardware_status?.hardware_status_name} /></TableCell>
                                                <TableCell><Badge variant={hardware.verification_status === 'verified' ? 'default' : 'secondary'}>{hardware.verification_status.replace('_', ' ')}</Badge></TableCell>
                                                <TableCell>{hardware.assigned_user?.branch?.branch_name || <span className="text-muted-foreground">—</span>}</TableCell>
                                                <TableCell><HardwareActions hardware={hardware} onDelete={setSelectedHardware} /></TableCell>
                                            </MotionRow>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="space-y-3 md:hidden">
                            <AnimatePresence initial={false}>
                                {hardwares.data.map((hardware, index) => (
                                    <motion.div
                                        key={hardware.id}
                                        layout
                                        variants={fadeRise}
                                        initial="hidden"
                                        animate="show"
                                        exit="hidden"
                                        transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                    >
                                        <Card size="sm">
                                            <CardContent className="space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <Link href={`/hardwares/${hardware.id}`} className="font-mono font-medium hover:underline">{hardware.hardware_no}</Link>
                                                        <div className="mt-1 font-mono text-xs text-muted-foreground">{hardware.hardware_serial_no}</div>
                                                    </div>
                                                    <Badge variant="outline">{hardware.hardware_status?.hardware_status_name || "Unknown Status"}</Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div><span className="text-muted-foreground">Type</span><p>{hardware.hardware_type?.hardware_type_name || "Unknown Type"}</p></div>
                                                    <div><span className="text-muted-foreground">Assigned to</span><p>{hardware.assigned_user?.user_name || "Unassigned"}</p></div>
                                                    <div className="col-span-2"><span className="text-muted-foreground">Branch</span><p>{hardware.assigned_user?.branch?.branch_name || <span className="text-muted-foreground">—</span>}</p></div>
                                                </div>
                                                <HardwareActions hardware={hardware} onDelete={setSelectedHardware} />
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
                            {hardwares.links?.map((link, index) => (
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
                            <p className="font-heading text-lg">{hasFilters ? "No hardware matches these filters." : "No hardware data exists."}</p>
                            <Button className="mt-4" onClick={hasFilters ? clearFilters : undefined} asChild={!hasFilters}>
                                {hasFilters ? "Clear" : <Link href="/hardwares/create">Add hardware</Link>}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </TooltipProvider>

            <AlertDialog
                open={Boolean(selectedHardware)}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setSelectedHardware(null);
                        setDeleteError("");
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedHardware?.hardware_no}?</AlertDialogTitle>
                        <AlertDialogDescription>It moves to deleted hardware. Its history stays.</AlertDialogDescription>
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
