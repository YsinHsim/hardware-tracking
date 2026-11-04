import React, { useMemo, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { BriefcaseBusiness, CircleDot, Computer, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fadeRise, listStagger, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const sections = [
    { label: "User positions", singular: "user position", dataKey: "userPositions", type: "user_positions", icon: BriefcaseBusiness },
    { label: "Hardware statuses", singular: "hardware status", dataKey: "hardwareStatuses", type: "hardware_statuses", icon: CircleDot },
    { label: "Hardware types", singular: "hardware type", dataKey: "hardwareTypes", type: "hardware_types", icon: Computer },
];

export default function Index(props) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemType, setItemType] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [search, setSearch] = useState("");

    const filteredSections = useMemo(
        () => sections.map((section) => ({
            ...section,
            data: (props[section.dataKey] ?? []).filter((item) =>
                item.name.toLowerCase().includes(search.trim().toLowerCase())
            ),
        })),
        [props, search]
    );
    const hasMatches = filteredSections.some((section) => section.data.length > 0);

    function handleDeleteClick(item, type) {
        setSelectedItem(item);
        setItemType(type);
        setConfirmation("");
        setDeleteError("");
    }

    function closeDialog() {
        if (deleting) return;
        setSelectedItem(null);
        setItemType("");
        setConfirmation("");
        setDeleteError("");
    }

    function handleDeleteConfirm(event) {
        event.preventDefault();
        if (!selectedItem || !itemType || confirmation !== selectedItem.name) return;
        setDeleting(true);
        router.delete(`/system-data/${itemType}/${selectedItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("System data deleted successfully!");
                setSelectedItem(null);
                setItemType("");
                setConfirmation("");
                setDeleteError("");
            },
            onError: (errors) => setDeleteError(errors.delete ?? "Failed to delete system data. Please try again."),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <Layout>
            <TooltipProvider>
                <div className="mb-6">
                    <h1 className="font-heading text-3xl font-semibold">System Data</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage user positions, hardware statuses and hardware types.</p>
                </div>

                <div className="mb-5 rounded-xl border border-border bg-card p-4">
                    <div className="relative w-full">
                        <Search className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search positions, statuses, types…"
                            aria-label="Search system data"
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {filteredSections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <section
                                key={section.type}
                                className="rounded-xl border border-border bg-card"
                                aria-label={section.label}
                            >
                                <div className="flex items-center justify-between gap-2 p-4 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                            <Icon className="size-4.5" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <h2 className="font-medium leading-tight">{section.label}</h2>
                                            <p className="text-sm text-muted-foreground" aria-live="polite">
                                                {section.data.length} {section.data.length === 1 ? "record" : "records"}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/system-data/create/${section.type}`}>
                                            <Plus />
                                            New
                                        </Link>
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2 border-t border-border p-4">
                                    <AnimatePresence initial={false}>
                                        {section.data.map((item, index) => (
                                            <motion.span
                                                key={item.id}
                                                layout
                                                variants={fadeRise}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                                className="inline-flex items-center gap-1 rounded-full border border-border bg-background py-1 pr-1 pl-3 text-sm"
                                            >
                                                <span className="max-w-45 truncate">{item.name}</span>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className="size-6 rounded-full"
                                                            asChild
                                                            aria-label={`Edit ${item.name}`}
                                                        >
                                                            <Link href={`/system-data/${section.type}/${item.id}/edit`}><Pencil className="size-3.5" /></Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className="size-6 rounded-full text-destructive hover:text-destructive"
                                                            onClick={() => handleDeleteClick(item, section.type)}
                                                            aria-label={`Delete ${item.name}`}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete</TooltipContent>
                                                </Tooltip>
                                            </motion.span>
                                        ))}
                                    </AnimatePresence>
                                    {section.data.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            {search.trim() !== "" ? "No matches here." : `No ${section.label.toLowerCase()} yet.`}
                                        </p>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {search.trim() !== "" && !hasMatches && (
                    <div className="mt-6 rounded-xl border border-border bg-card py-10 text-center">
                        <p className="font-heading text-lg">Nothing matches “{search.trim()}”.</p>
                        <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>Clear search</Button>
                    </div>
                )}
            </TooltipProvider>

            <AlertDialog open={Boolean(selectedItem)} onOpenChange={(open) => { if (!open) closeDialog(); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedItem?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>Type <span className="font-medium text-foreground">{selectedItem?.name}</span> exactly to confirm deletion.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="delete-confirmation">Name</Label>
                        <Input
                            id="delete-confirmation"
                            value={confirmation}
                            onChange={(event) => setConfirmation(event.target.value)}
                            placeholder="Enter name to confirm"
                            autoComplete="off"
                            disabled={deleting}
                        />
                    </div>
                    {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={deleting || confirmation !== selectedItem?.name}
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
}
