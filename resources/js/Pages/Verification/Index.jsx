import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ClipboardCheck, Eye, ShieldAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import HardwareStatusBadge from "@/components/HardwareStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fadeRise, listStagger, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MotionRow = motion.create(TableRow);

function submittedAgo(value) {
    if (!value) return "—";
    const then = new Date(value);
    const seconds = Math.max(1, Math.floor((Date.now() - then.getTime()) / 1000));
    const steps = [
        [86400 * 365, "year"],
        [86400 * 30, "month"],
        [86400 * 7, "week"],
        [86400, "day"],
        [3600, "hour"],
        [60, "minute"],
    ];
    for (const [size, unit] of steps) {
        if (seconds >= size) {
            const n = Math.floor(seconds / size);
            return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
        }
    }
    return "just now";
}

function DetailField({ label, children, className }) {
    return (
        <div className={cn("min-w-0", className)}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <div className="mt-1 text-sm">{children || <span className="text-muted-foreground">—</span>}</div>
        </div>
    );
}

export default function Verification({ hardware }) {
    const { auth } = usePage().props;
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState("");
    const [pendingAction, setPendingAction] = useState(null); // 'changes_requested' | 'rejected' | null
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    function openReview(item) {
        setSelected(item);
        setNotes("");
        setPendingAction(null);
        setErrors({});
    }

    function closeReview() {
        if (submitting) return;
        setSelected(null);
        setPendingAction(null);
        setNotes("");
        setErrors({});
    }

    function submit(status) {
        if (!selected) return;
        setSubmitting(true);
        setErrors({});
        router.put(
            `/verification/${selected.id}`,
            { status, notes: notes.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        status === "verified"
                            ? `${selected.hardware_no} verified.`
                            : status === "changes_requested"
                                ? `Changes requested on ${selected.hardware_no}.`
                                : `${selected.hardware_no} rejected.`
                    );
                    setSelected(null);
                    setPendingAction(null);
                    setNotes("");
                },
                onError: (bag) => setErrors(bag),
                onFinish: () => setSubmitting(false),
            }
        );
    }

    const isOwnSubmission = selected && auth?.user?.id === selected.submitter?.id;

    return (
        <Layout>
            <Head title="Verification queue" />
            <PageHeader
                icon={ClipboardCheck}
                title="Verification queue"
                description="Review hardware assignments submitted by users in your branch."
                actions={
                    <Badge variant="secondary" className="px-3 py-1 text-sm">
                        {hardware.length} pending
                    </Badge>
                }
            />

            {hardware.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        No hardware awaiting verification.
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden rounded-xl border border-border bg-card md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tag</TableHead>
                                    <TableHead>Assigned to</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Condition</TableHead>
                                    <TableHead>Submitted by</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence initial={false}>
                                    {hardware.map((item, index) => (
                                        <MotionRow
                                            key={item.id}
                                            layout
                                            variants={fadeRise}
                                            initial="hidden"
                                            animate="show"
                                            exit="hidden"
                                            transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                        >
                                            <TableCell>
                                                <div className="font-mono font-medium">{item.hardware_no}</div>
                                                <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                    {item.hardware_serial_no}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.assigned_user?.user_name || (
                                                    <span className="text-muted-foreground">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{item.hardware_type?.hardware_type_name || "—"}</TableCell>
                                            <TableCell>
                                                <HardwareStatusBadge status={item.hardware_status?.hardware_status_name} />
                                            </TableCell>
                                            <TableCell>{item.submitter?.name || "—"}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {submittedAgo(item.created_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openReview(item)}
                                                >
                                                    <Eye className="size-4" aria-hidden="true" />
                                                    Review
                                                </Button>
                                            </TableCell>
                                        </MotionRow>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                        {hardware.map((item, index) => (
                            <motion.div
                                key={item.id}
                                variants={fadeRise}
                                initial="hidden"
                                animate="show"
                                transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                            >
                                <Card>
                                    <CardContent className="space-y-3 pt-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="font-mono font-medium">{item.hardware_no}</div>
                                                <div className="font-mono text-xs text-muted-foreground">
                                                    {item.hardware_serial_no}
                                                </div>
                                            </div>
                                            <HardwareStatusBadge status={item.hardware_status?.hardware_status_name} />
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <DetailField label="Assigned to">{item.assigned_user?.user_name}</DetailField>
                                            <DetailField label="Type">{item.hardware_type?.hardware_type_name}</DetailField>
                                            <DetailField label="Submitted by">{item.submitter?.name}</DetailField>
                                            <DetailField label="Submitted">{submittedAgo(item.created_at)}</DetailField>
                                        </div>
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => openReview(item)}
                                        >
                                            <Eye className="size-4" aria-hidden="true" />
                                            Review
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && closeReview()}>
                <DialogContent className="sm:max-w-lg">
                    {selected && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="font-mono">{selected.hardware_no}</DialogTitle>
                                <DialogDescription>
                                    {selected.hardware_serial_no} · {selected.hardware_type?.hardware_type_name || "Unknown type"}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailField label="Assigned to">
                                        {selected.assigned_user?.user_name || "Unassigned"}
                                    </DetailField>
                                    <DetailField label="Branch">
                                        {selected.assigned_user?.branch?.branch_name}
                                    </DetailField>
                                    <DetailField label="Condition">
                                        <HardwareStatusBadge status={selected.hardware_status?.hardware_status_name} />
                                    </DetailField>
                                    <DetailField label="Submitted">
                                        {submittedAgo(selected.created_at)}
                                    </DetailField>
                                    <DetailField label="Submitted by" className="col-span-2">
                                        {selected.submitter?.name || "—"}
                                    </DetailField>
                                </div>

                                {isOwnSubmission && (
                                    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                                        <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                        <p>You submitted this hardware. Another reviewer must action it.</p>
                                    </div>
                                )}

                                {pendingAction && (
                                    <div className="space-y-2">
                                        <Label htmlFor="review-notes">
                                            Review notes <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            id="review-notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder={
                                                pendingAction === "rejected"
                                                    ? "Explain why this submission is rejected."
                                                    : "Tell the submitter what to correct."
                                            }
                                            rows={4}
                                            aria-invalid={Boolean(errors.notes)}
                                            autoFocus
                                        />
                                        {errors.notes && (
                                            <p className="text-sm text-destructive">{errors.notes}</p>
                                        )}
                                    </div>
                                )}

                                {!pendingAction && (
                                    <p className="text-xs text-muted-foreground">
                                        Verify to approve. Choose <span className="font-medium">Request changes</span> or <span className="font-medium">Reject</span> to add notes.
                                    </p>
                                )}
                            </div>

                            <DialogFooter>
                                {!pendingAction ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setPendingAction("rejected")}
                                            disabled={submitting || isOwnSubmission}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setPendingAction("changes_requested")}
                                            disabled={submitting || isOwnSubmission}
                                        >
                                            Request changes
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => submit("verified")}
                                            disabled={submitting || isOwnSubmission}
                                        >
                                            Verify assignment
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                setPendingAction(null);
                                                setErrors({});
                                            }}
                                            disabled={submitting}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => submit(pendingAction)}
                                            disabled={submitting || notes.trim().length === 0}
                                        >
                                            {pendingAction === "rejected" ? "Confirm rejection" : "Send change request"}
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
