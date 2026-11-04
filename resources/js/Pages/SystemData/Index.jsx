import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fadeRise, listStagger, spring } from "@/lib/motion";

const MotionRow = motion.create(TableRow);
const sections = [
    { label: "User positions", singular: "user position", dataKey: "userPositions", type: "user_positions" },
    { label: "Hardware statuses", singular: "hardware status", dataKey: "hardwareStatuses", type: "hardware_statuses" },
    { label: "Hardware types", singular: "hardware type", dataKey: "hardwareTypes", type: "hardware_types" },
];

export default function Index(props) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemType, setItemType] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

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

                <Tabs defaultValue="user_positions">
                    <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
                        {sections.map((section) => <TabsTrigger key={section.type} value={section.type}>{section.label}</TabsTrigger>)}
                    </TabsList>
                    {sections.map((section) => {
                        const data = props[section.dataKey] ?? [];
                        return (
                            <TabsContent key={section.type} value={section.type} className="mt-4">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <h2 className="font-heading text-xl font-medium">{section.label}</h2>
                                    <Button asChild><Link href={`/system-data/create/${section.type}`}><Plus /> New {section.singular}</Link></Button>
                                </div>
                                <div className="rounded-xl border border-border bg-card">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead><span className="sr-only">Actions</span></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence initial={false}>
                                                {data.map((item, index) => (
                                                    <MotionRow
                                                        key={item.id}
                                                        layout
                                                        variants={fadeRise}
                                                        initial="hidden"
                                                        animate="show"
                                                        exit="hidden"
                                                        transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                                    >
                                                        <TableCell className="font-medium">{item.name}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="icon-sm" asChild aria-label={`Edit ${item.name}`}>
                                                                            <Link href={`/system-data/${section.type}/${item.id}/edit`}><Pencil /></Link>
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
                                                                            onClick={() => handleDeleteClick(item, section.type)}
                                                                            aria-label={`Delete ${item.name}`}
                                                                        >
                                                                            <Trash2 />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Delete</TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                        </TableCell>
                                                    </MotionRow>
                                                ))}
                                            </AnimatePresence>
                                            {data.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No {section.label.toLowerCase()} available.</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        );
                    })}
                </Tabs>
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
