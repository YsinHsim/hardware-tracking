import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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

export default function Show({ user }) {
    const [showAlert, setShowAlert] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const details = [
        { label: "Position", value: user.user_position?.position_name || "N/A" },
        { label: "Estate", value: user.estate?.estate_name || "N/A" },
        { label: "Region", value: user.estate?.region?.region_name || "N/A" },
    ];

    function confirmDelete(event) {
        event.preventDefault();
        setDeleting(true);
        router.delete(`/users/${user.id}`, {
            onSuccess: () => {
                toast.success("User deleted successfully!");
                setShowAlert(false);
                router.visit("/users");
            },
            onError: (errors) => setDeleteError(errors.delete ?? "Failed to delete user. Please try again."),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <Layout>
            <PageHeader
                icon={ IdCard }
                title="User details"
                description="Assigned user information and hardware."
            />

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">{user.user_name}</CardTitle>
                    <CardDescription>User information</CardDescription>
                    <CardAction className="flex gap-2">
                        <Button variant="outline" asChild><Link href={`/users/${user.id}/edit`}><Pencil /> Edit</Link></Button>
                        <Button variant="destructive" onClick={() => { setDeleteError(""); setShowAlert(true); }}><Trash2 /> Delete</Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                        {details.map((detail) => (
                            <div key={detail.label}>
                                <dt className="text-sm text-muted-foreground">{detail.label}</dt>
                                <dd className="mt-1">{detail.value}</dd>
                            </div>
                        ))}
                    </dl>
                </CardContent>
            </Card>

            <Card className="mt-5">
                <CardHeader>
                    <CardTitle className="text-xl">Assigned hardware</CardTitle>
                    <CardDescription>Devices currently assigned to {user.user_name}.</CardDescription>
                    <CardAction><Button asChild><Link href="/hardwares/create"><Plus /> Add hardware</Link></Button></CardAction>
                </CardHeader>
                <CardContent>
                    {user.hardwares && user.hardwares.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow><TableHead>Tag</TableHead><TableHead>Serial number</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Last updated</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {user.hardwares.map((hardware, index) => (
                                    <MotionRow
                                        key={hardware.id}
                                        variants={fadeRise}
                                        initial="hidden"
                                        animate="show"
                                        transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                    >
                                        <TableCell><Link href={`/hardwares/${hardware.id}`} className="font-mono font-medium hover:underline">{hardware.hardware_no}</Link></TableCell>
                                        <TableCell className="font-mono">{hardware.hardware_serial_no}</TableCell>
                                        <TableCell>{hardware.hardware_type?.hardware_type_name || "N/A"}</TableCell>
                                        <TableCell><Badge variant="outline">{hardware.hardware_status?.hardware_status_name || "N/A"}</Badge></TableCell>
                                        <TableCell>{new Date(hardware.updated_at).toLocaleString()}</TableCell>
                                    </MotionRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : <p className="text-sm text-muted-foreground">No hardware assigned to this user.</p>}
                </CardContent>
            </Card>

            <AlertDialog open={showAlert} onOpenChange={(open) => { if (!deleting) { setShowAlert(open); if (!open) setDeleteError(""); } }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {user.user_name}?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the assigned user.</AlertDialogDescription>
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
