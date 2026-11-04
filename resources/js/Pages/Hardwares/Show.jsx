import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { FileSearch, FileText, LayoutGrid, Pencil, Table2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
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
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fadeRise, listStagger, spring } from "@/lib/motion";

const MotionRow = motion.create(TableRow);

export default function Show({ hardware }) {
    const [showAlert, setShowAlert] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [viewMode, setViewMode] = useState("table");
    const details = [
        { label: "Serial number", value: hardware.hardware_serial_no, mono: true },
        { label: "Type", value: hardware.hardware_type?.hardware_type_name || "N/A" },
        { label: "Status", value: hardware.hardware_status?.hardware_status_name || "N/A", badge: true },
        { label: "Branch", value: hardware.assigned_user?.estate?.estate_name || "N/A" },
    ];

    function confirmDelete(event) {
        event.preventDefault();
        setDeleting(true);
        router.delete(`/hardwares/${hardware.id}`, {
            onSuccess: () => {
                toast.success("Hardware deleted");
                setShowAlert(false);
                router.visit("/hardwares");
            },
            onError: (errors) => setDeleteError(errors.delete ?? "Failed to delete hardware. Please try again."),
            onFinish: () => setDeleting(false),
        });
    }

    const historyMotion = {
        variants: fadeRise,
        initial: "hidden",
        animate: "show",
        transition: spring,
    };

    return (
        <Layout>
            <PageHeader
                icon={ FileSearch }
                title="Hardware details"
                description="Device information and its complete history."
            backHref="/hardwares"
                    backLabel="Back to hardware"
                />

            <Card>
                <CardHeader>
                    <CardTitle className="font-mono text-xl">{hardware.hardware_no}</CardTitle>
                    <CardDescription>Hardware information</CardDescription>
                    <CardAction className="flex gap-2">
                        <Button variant="outline" asChild><Link href={`/report/${hardware.id}`}><FileText /> Report</Link></Button>
                        <Button variant="outline" asChild><Link href={`/hardwares/${hardware.id}/edit`}><Pencil /> Edit</Link></Button>
                        <Button variant="destructive" onClick={() => { setDeleteError(""); setShowAlert(true); }}><Trash2 /> Delete</Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                        {details.map((detail) => (
                            <div key={detail.label}>
                                <dt className="text-sm text-muted-foreground">{detail.label}</dt>
                                <dd className={`mt-1 ${detail.mono ? "font-mono" : ""}`}>
                                    {detail.badge ? <Badge variant="outline">{detail.value}</Badge> : detail.value}
                                </dd>
                            </div>
                        ))}
                        <div>
                            <dt className="text-sm text-muted-foreground">Assigned user</dt>
                            <dd className="mt-1">
                                {hardware.assigned_user?.id ? (
                                    <Link href={`/users/${hardware.assigned_user.id}`} className="hover:underline">{hardware.assigned_user.user_name}</Link>
                                ) : "Unassigned"}
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <Card className="mt-5">
                <CardHeader>
                    <CardTitle className="text-xl">Hardware history</CardTitle>
                    <CardDescription>A record of changes made to this device.</CardDescription>
                    <CardAction className="flex gap-1 rounded-lg border border-border p-1" aria-label="History view">
                        <Button variant={viewMode === "table" ? "default" : "ghost"} size="icon-sm" onClick={() => setViewMode("table")} aria-label="Table view" aria-pressed={viewMode === "table"}><Table2 /></Button>
                        <Button variant={viewMode === "cards" ? "default" : "ghost"} size="icon-sm" onClick={() => setViewMode("cards")} aria-label="Card view" aria-pressed={viewMode === "cards"}><LayoutGrid /></Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    {hardware.update_records && hardware.update_records.length > 0 ? (
                        viewMode === "table" ? (
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Record</TableHead><TableHead>Remarks</TableHead><TableHead>By</TableHead><TableHead>Date</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hardware.update_records.map((record, index) => (
                                        <MotionRow
                                            key={record.id}
                                            {...historyMotion}
                                            transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                        >
                                            <TableCell className="font-medium">{record.record_name}</TableCell>
                                            <TableCell className="whitespace-normal">{record.record_desc}</TableCell>
                                            <TableCell>{record.user?.name ?? "Unknown"}</TableCell>
                                            <TableCell>{new Date(record.created_at).toLocaleString()}</TableCell>
                                        </MotionRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" initial="hidden" animate="show">
                                {hardware.update_records.map((record, index) => (
                                    <motion.div key={record.id} {...historyMotion} transition={{ ...spring, delay: index * listStagger.staggerChildren }} className="rounded-lg border border-border p-4">
                                        <p className="font-medium">{record.record_name}</p>
                                        <p className="mt-2 text-sm text-muted-foreground">{record.record_desc}</p>
                                        <p className="mt-4 text-sm">By {record.user?.name ?? "Unknown"}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{new Date(record.created_at).toLocaleString()}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )
                    ) : <p className="text-sm text-muted-foreground">No update records available.</p>}
                </CardContent>
            </Card>

            <AlertDialog open={showAlert} onOpenChange={(open) => { if (!deleting) { setShowAlert(open); if (!open) setDeleteError(""); } }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {hardware.hardware_no}?</AlertDialogTitle>
                        <AlertDialogDescription>It moves to deleted hardware. Its history stays.</AlertDialogDescription>
                    </AlertDialogHeader>
                    {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
}
