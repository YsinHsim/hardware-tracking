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
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fadeRise, listStagger, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MotionRow = motion.create(TableRow);

function EstateActions({ estate, onDelete }) {
    return (
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" asChild aria-label={`Edit ${estate.estate_name}`}>
                        <Link href={`/estates/${estate.id}/edit`}><Pencil /></Link>
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
                        onClick={() => onDelete(estate)}
                        aria-label={`Delete ${estate.estate_name}`}
                    >
                        <Trash2 />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}

export default function Index({ estates }) {
    const [selectedEstate, setSelectedEstate] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    function confirmDelete(event) {
        event.preventDefault();
        if (!selectedEstate) return;
        setDeleting(true);
        router.delete(`/estates/${selectedEstate.id}`, {
            onSuccess: () => {
                toast.success("Estate deleted successfully!");
                setSelectedEstate(null);
                setDeleteError("");
            },
            onError: (errors) => setDeleteError(errors.delete ?? "Failed to delete estate. Please try again."),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <Layout>
            <TooltipProvider>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-heading text-3xl font-semibold">Estates</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Manage estates and their regions.</p>
                    </div>
                    <Button asChild><Link href="/estates/create"><Plus /> Add estate</Link></Button>
                </div>

                {estates.data.length > 0 ? (
                    <>
                        <div className="hidden rounded-xl border border-border bg-card md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Estate</TableHead>
                                        <TableHead>Region</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence initial={false}>
                                        {estates.data.map((estate, index) => (
                                            <MotionRow
                                                key={estate.id}
                                                layout
                                                variants={fadeRise}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                            >
                                                <TableCell className="font-medium">{estate.estate_name}</TableCell>
                                                <TableCell>{estate.region?.region_name || "N/A"}</TableCell>
                                                <TableCell><EstateActions estate={estate} onDelete={setSelectedEstate} /></TableCell>
                                            </MotionRow>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="space-y-3 md:hidden">
                            <AnimatePresence initial={false}>
                                {estates.data.map((estate, index) => (
                                    <motion.div
                                        key={estate.id}
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
                                                    <p className="font-medium">{estate.estate_name}</p>
                                                    <p className="mt-1 text-sm text-muted-foreground">{estate.region?.region_name || "N/A"}</p>
                                                </div>
                                                <EstateActions estate={estate} onDelete={setSelectedEstate} />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <nav className="mt-5 flex flex-wrap justify-end gap-1" aria-label="Pagination">
                            {estates.links?.map((link, index) => (
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
                    </>
                ) : (
                    <Card className="items-center py-10 text-center">
                        <CardContent>
                            <p className="font-heading text-lg">No estate data exists.</p>
                            <Button className="mt-4" asChild><Link href="/estates/create">Add estate</Link></Button>
                        </CardContent>
                    </Card>
                )}
            </TooltipProvider>

            <AlertDialog
                open={Boolean(selectedEstate)}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setSelectedEstate(null);
                        setDeleteError("");
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedEstate?.estate_name}?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the estate.</AlertDialogDescription>
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
