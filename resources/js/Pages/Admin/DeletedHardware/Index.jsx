import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ArchiveRestore, MonitorX, ShieldAlert, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../../Layouts/Layout";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fadeRise, spring } from "@/lib/motion";

export default function DeletedHardwareIndex({ hardware }) {
    const { errors } = usePage().props;
    const [selected, setSelected] = useState(new Set());
    const [deleteTargets, setDeleteTargets] = useState([]);
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [processing, setProcessing] = useState(false);
    const selectedOnPage = hardware.filter((item) => selected.has(item.id));
    const allSelected = hardware.length > 0 && selectedOnPage.length === hardware.length;

    const toggle = (id) => setSelected((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });

    function closeDelete() {
        if (processing) return;
        setDeleteTargets([]);
        setPassword("");
        setConfirmation("");
    }

    function restore(item) {
        router.post(`/admin/deleted-hardware/${item.id}/restore`, {}, {
            onSuccess: () => toast.success(`${item.hardware_no} restored.`),
            onError: () => toast.error("Could not restore hardware."),
            preserveScroll: true,
        });
    }

    function permanentlyDelete() {
        setProcessing(true);
        router.delete("/admin/deleted-hardware", {
            data: { ids: deleteTargets.map((item) => item.id), password, confirmation },
            onSuccess: () => {
                toast.success(deleteTargets.length === 1 ? "Hardware permanently deleted." : "Hardware records permanently deleted.");
                setSelected(new Set());
                closeDelete();
            },
            onError: () => toast.error("Please fix the highlighted fields."),
            onFinish: () => setProcessing(false),
            preserveState: true,
            preserveScroll: true,
        });
    }

    return (
        <Layout>
            <Head title="Deleted hardware" />
            <PageHeader
                icon={MonitorX}
                title="Deleted hardware"
                description="Restore deleted devices or permanently remove their records and history."
            />

            <motion.div variants={fadeRise} initial="hidden" animate="show" transition={spring} className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
                    <p className="text-muted-foreground">Serial numbers stay reserved while records are here.</p>
                    <Button variant="destructive" disabled={selectedOnPage.length === 0} onClick={() => setDeleteTargets(selectedOnPage)}>
                        <Trash2 /> Delete selected{selectedOnPage.length > 0 ? ` (${selectedOnPage.length})` : ""}
                    </Button>
                </div>
                {errors.delete && <p className="text-sm text-destructive">{errors.delete}</p>}
                {errors.restore && <p className="text-sm text-destructive">{errors.restore}</p>}

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={() => setSelected(allSelected ? new Set() : new Set(hardware.map((item) => item.id)))}
                                            aria-label="Select all deleted hardware"
                                        />
                                    </TableHead>
                                    <TableHead>Hardware</TableHead>
                                    <TableHead>Serial number</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Last assignment</TableHead>
                                    <TableHead>Deleted</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hardware.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell><Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggle(item.id)} aria-label={`Select ${item.hardware_no}`} /></TableCell>
                                        <TableCell className="font-mono font-medium">{item.hardware_no}</TableCell>
                                        <TableCell className="font-mono">{item.hardware_serial_no}</TableCell>
                                        <TableCell>{item.type}</TableCell>
                                        <TableCell><p>{item.assigned_user}</p><p className="text-xs text-muted-foreground">{item.branch}</p></TableCell>
                                        <TableCell>{new Date(item.deleted_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <Button variant="outline" size="sm" onClick={() => restore(item)}><ArchiveRestore /> Restore</Button>
                                            <Button variant="ghost" size="icon-sm" className="ml-1 text-destructive" onClick={() => setDeleteTargets([item])} aria-label={`Permanently delete ${item.hardware_no}`}><Trash2 /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {hardware.length === 0 && (
                                    <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No deleted hardware.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>

            <AlertDialog open={deleteTargets.length > 0} onOpenChange={(open) => !open && closeDelete()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive"><ShieldAlert /> Permanently delete {deleteTargets.length} record{deleteTargets.length === 1 ? "" : "s"}?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>This cannot be undone. Hardware details and all associated update history will be removed.</p>
                                <ul className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-border p-3 font-mono text-xs">
                                    {deleteTargets.map((item) => <li key={item.id}>{item.hardware_no} — {item.hardware_serial_no}</li>)}
                                </ul>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="delete-confirmation">Type PERMANENTLY DELETE</Label>
                            <Input id="delete-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" aria-invalid={Boolean(errors.confirmation)} />
                            {errors.confirmation && <p className="text-sm text-destructive">{errors.confirmation}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-password">Your admin password</Label>
                            <Input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" aria-invalid={Boolean(errors.password)} />
                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" disabled={processing || confirmation !== "PERMANENTLY DELETE" || !password} onClick={(event) => { event.preventDefault(); permanentlyDelete(); }}>
                            {processing ? "Deleting…" : "Permanently delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
}
