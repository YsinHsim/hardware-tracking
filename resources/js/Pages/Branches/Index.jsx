import React, { useEffect, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Building2, ChevronDown, Filter, Pencil, Plus, Search, Trash2, X } from "lucide-react";
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

function BranchActions({ branch, onDelete }) {
    return (
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" asChild aria-label={`Edit ${branch.branch_name}`}>
                        <Link href={`/branches/${branch.id}/edit`}><Pencil /></Link>
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
                        onClick={() => onDelete(branch)}
                        aria-label={`Delete ${branch.branch_name}`}
                    >
                        <Trash2 />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}

export default function Index({ branches, filters, regions, total }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedBranch, setSelectedEstate] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const latestFilters = useRef(filters);
    const initialSearch = useRef(true);
    const searchDebounceTimeout = useRef(null);
    const hasFilters =
        filters.search !== "" ||
        filters.region_id !== null ||
        filters.per_page !== 10;

    const activeFilters = [
        filters.region_id !== null && {
            key: "region_id",
            label: regions.find((region) => region.id === filters.region_id)?.region_name ?? "Region",
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
        if (values.region_id) params.region_id = values.region_id;
        if (Number(values.per_page) !== 10) params.per_page = values.per_page;
        router.get("/branches", params, { preserveState: true, preserveScroll: true, replace: true });
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
        router.get("/branches", {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    function confirmDelete(event) {
        event.preventDefault();
        if (!selectedBranch) return;
        setDeleting(true);
        router.delete(`/branches/${selectedBranch.id}`, {
            onSuccess: () => {
                toast.success("Branch deleted successfully!");
                setSelectedEstate(null);
                setDeleteError("");
            },
            onError: (errors) => setDeleteError(errors.delete ?? "Failed to delete branch. Please try again."),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <Layout>
            <TooltipProvider>
                <PageHeader
                    icon={ Building2 }
                    title="Branches"
                    description="Manage branches and their regions."
                />

                <div className="mb-5 rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="relative w-full">
                            <Search className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search branch, region…"
                                aria-label="Search branches"
                                className="pl-8"
                            />
                        </div>
                        <Button asChild className="shrink-0 sm:ml-auto">
                            <Link href="/branches/create"><Plus /> Add branch</Link>
                        </Button>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFiltersOpen((open) => !open)}
                            aria-expanded={filtersOpen}
                            aria-controls="branch-filters"
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
                                {total} {total === 1 ? "branch" : "branches"}
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
                        <div id="branch-filters" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <Select
                                value={filters.region_id == null ? "none" : String(filters.region_id)}
                                onValueChange={(next) => handleSelect("region_id", next)}
                            >
                                <SelectTrigger className="w-full" aria-label="Filter by region">
                                    <SelectValue placeholder="All regions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All regions</SelectItem>
                                    {regions.map((region) => (
                                        <SelectItem key={region.id} value={String(region.id)}>{region.region_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center">
                                {hasFilters && <Button variant="ghost" onClick={clearFilters}>Clear all</Button>}
                            </div>
                        </div>
                    )}
                </div>

                {branches.data.length > 0 ? (
                    <>
                        <div className="hidden rounded-xl border border-border bg-card md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Region</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence initial={false}>
                                        {branches.data.map((branch, index) => (
                                            <MotionRow
                                                key={branch.id}
                                                layout
                                                variants={fadeRise}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                            >
                                                <TableCell className="font-medium">{branch.branch_name}</TableCell>
                                                <TableCell>{branch.region?.region_name || "N/A"}</TableCell>
                                                <TableCell><BranchActions branch={branch} onDelete={setSelectedEstate} /></TableCell>
                                            </MotionRow>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="space-y-3 md:hidden">
                            <AnimatePresence initial={false}>
                                {branches.data.map((branch, index) => (
                                    <motion.div
                                        key={branch.id}
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
                                                    <p className="font-medium">{branch.branch_name}</p>
                                                    <p className="mt-1 text-sm text-muted-foreground">{branch.region?.region_name || "N/A"}</p>
                                                </div>
                                                <BranchActions branch={branch} onDelete={setSelectedEstate} />
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
                                {branches.links?.map((link, index) => (
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
                            <p className="font-heading text-lg">{hasFilters ? "No branches match these filters." : "No branch data exists."}</p>
                            <Button className="mt-4" onClick={hasFilters ? clearFilters : undefined} asChild={!hasFilters}>
                                {hasFilters ? "Clear" : <Link href="/branches/create">Add branch</Link>}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </TooltipProvider>

            <AlertDialog
                open={Boolean(selectedBranch)}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setSelectedEstate(null);
                        setDeleteError("");
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedBranch?.branch_name}?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the branch.</AlertDialogDescription>
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
