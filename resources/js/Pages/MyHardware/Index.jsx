import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Monitor, Plus } from "lucide-react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const emptyValues = { hardware_no: "", hardware_serial_no: "", hardware_type_id: "", hardware_status_id: "" };

export default function MyHardware({ hardware, hardwareTypes, hardwareStatuses }) {
    const { errors } = usePage().props;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [values, setValues] = useState(emptyValues);
    const update = (key, value) => setValues((v) => ({ ...v, [key]: value }));

    function openCreate() {
        setEditing(null);
        setValues(emptyValues);
        setOpen(true);
    }

    function openEdit(item) {
        setEditing(item);
        setValues({
            hardware_no: item.hardware_no,
            hardware_serial_no: item.hardware_serial_no,
            hardware_type_id: String(item.hardware_type_id),
            hardware_status_id: String(item.hardware_status_id),
        });
        setOpen(true);
    }

    function submit(event) {
        event.preventDefault();
        const options = {
            onSuccess: () => { setOpen(false); toast.success(editing ? 'Hardware resubmitted for verification.' : 'Hardware submitted for verification.'); },
            onError: () => toast.error('Please fix the highlighted fields.'),
        };
        if (editing) {
            router.put(`/my-hardware/${editing.id}`, values, options);
        } else {
            router.post('/my-hardware', values, options);
        }
    }

    return (
        <Layout>
            <Head title="My hardware" />
            <PageHeader icon={Monitor} title="My hardware" description="Register your hardware and track its verification." actions={<Button onClick={openCreate}><Plus /> Register hardware</Button>} />
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>Hardware</TableHead><TableHead>Serial</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Verification</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {hardware.map((item) => (
                                <React.Fragment key={item.id}>
                                    <TableRow>
                                        <TableCell className="font-mono">{item.hardware_no}</TableCell>
                                        <TableCell className="font-mono">{item.hardware_serial_no}</TableCell>
                                        <TableCell>{item.hardware_type?.hardware_type_name}</TableCell>
                                        <TableCell>{item.hardware_status?.hardware_status_name}</TableCell>
                                        <TableCell><Badge variant={item.verification_status === 'verified' ? 'default' : 'secondary'}>{item.verification_status.replace('_', ' ')}</Badge></TableCell>
                                        <TableCell className="text-right">{item.verification_status === 'changes_requested' && <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Edit & resubmit</Button>}</TableCell>
                                    </TableRow>
                                    {item.verifications?.map((review) => (
                                        <TableRow key={`review-${review.id}`} className="bg-muted/30 hover:bg-muted/30">
                                            <TableCell colSpan={6} className="py-3 text-sm">
                                                <span className="font-medium">Review by {review.reviewer?.name ?? 'Unknown'}:</span>{' '}
                                                <span className="text-muted-foreground">{review.notes || `Marked ${review.status.replace('_', ' ')}.`} · {new Date(review.created_at).toLocaleString()}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))}
                            {hardware.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No hardware registered yet.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editing ? 'Edit and resubmit hardware' : 'Register hardware'}</DialogTitle></DialogHeader>
                    {editing && <p className="text-sm text-muted-foreground">Address the reviewer’s notes. Resubmitting returns this hardware to pending.</p>}
                    <form onSubmit={submit} className="space-y-4">
                        {[['hardware_no', 'Hardware number'], ['hardware_serial_no', 'Serial number']].map(([key, label]) => (
                            <div className="space-y-2" key={key}><Label>{label}</Label><Input value={values[key]} onChange={(e) => update(key, e.target.value)} aria-invalid={Boolean(errors[key])} required />{errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}</div>
                        ))}
                        {[['hardware_type_id', 'Hardware type', hardwareTypes, 'hardware_type_name'], ['hardware_status_id', 'Condition', hardwareStatuses, 'hardware_status_name']].map(([key, label, items, name]) => (
                            <div className="space-y-2" key={key}><Label>{label}</Label><Select name={key} value={values[key]} onValueChange={(v) => update(key, v)} required><SelectTrigger className="w-full" aria-invalid={Boolean(errors[key])}><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger><SelectContent>{items.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item[name]}</SelectItem>)}</SelectContent></Select>{errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}</div>
                        ))}
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button>{editing ? 'Resubmit for verification' : 'Submit for verification'}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
