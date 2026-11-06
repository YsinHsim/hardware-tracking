import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Verification({ hardware }) {
    const [notes, setNotes] = useState({});
    function review(item, status) {
        router.put(`/verification/${item.id}`, { status, notes: notes[item.id] || '' }, { onSuccess: () => toast.success('Verification updated.'), preserveScroll: true });
    }
    return <Layout><Head title="Verification queue" /><PageHeader icon={ClipboardCheck} title="Verification queue" description="Review hardware assignments submitted by users in your branch." /><div className="space-y-4">{hardware.map((item) => <Card key={item.id}><CardHeader><CardTitle className="font-mono">{item.hardware_no}</CardTitle><CardDescription>{item.hardware_serial_no} · {item.hardware_type?.hardware_type_name}</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-muted-foreground">Assigned user</p><p>{item.assigned_user?.user_name}</p></div><div><p className="text-muted-foreground">Branch</p><p>{item.assigned_user?.branch?.branch_name}</p></div><div><p className="text-muted-foreground">Submitted by</p><p>{item.submitter?.name}</p></div></div><div className="space-y-2"><Label>Review notes (required unless verifying)</Label><Textarea value={notes[item.id] || ''} onChange={(e) => setNotes((n) => ({...n,[item.id]:e.target.value}))} /></div><div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => review(item,'rejected')}>Reject</Button><Button variant="secondary" onClick={() => review(item,'changes_requested')}>Request changes</Button><Button onClick={() => review(item,'verified')}>Verify assignment</Button></div></CardContent></Card>)}{hardware.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No hardware awaiting verification.</CardContent></Card>}</div></Layout>;
}
