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

export default function MyHardware({ hardware, hardwareTypes, hardwareStatuses }) {
    const { errors } = usePage().props;
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState({ hardware_no: "", hardware_serial_no: "", hardware_type_id: "", hardware_status_id: "" });
    const update = (key, value) => setValues((v) => ({ ...v, [key]: value }));
    function submit(event) {
        event.preventDefault();
        router.post('/my-hardware', values, { onSuccess: () => { setOpen(false); toast.success('Hardware submitted for verification.'); }, onError: () => toast.error('Please fix the highlighted fields.') });
    }
    return <Layout><Head title="My hardware" /><PageHeader icon={Monitor} title="My hardware" description="Register your hardware and track its verification." actions={<Button onClick={() => setOpen(true)}><Plus /> Register hardware</Button>} /><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Hardware</TableHead><TableHead>Serial</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Verification</TableHead></TableRow></TableHeader><TableBody>{hardware.map((item) => <TableRow key={item.id}><TableCell className="font-mono">{item.hardware_no}</TableCell><TableCell className="font-mono">{item.hardware_serial_no}</TableCell><TableCell>{item.hardware_type?.hardware_type_name}</TableCell><TableCell>{item.hardware_status?.hardware_status_name}</TableCell><TableCell><Badge variant={item.verification_status === 'verified' ? 'default' : 'secondary'}>{item.verification_status.replace('_', ' ')}</Badge></TableCell></TableRow>)}{hardware.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No hardware registered yet.</TableCell></TableRow>}</TableBody></Table></CardContent></Card><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Register hardware</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-4">{[['hardware_no','Hardware number'],['hardware_serial_no','Serial number']].map(([key,label]) => <div className="space-y-2" key={key}><Label>{label}</Label><Input value={values[key]} onChange={(e) => update(key,e.target.value)} required />{errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}</div>)}{[['hardware_type_id','Hardware type',hardwareTypes,'hardware_type_name'],['hardware_status_id','Condition',hardwareStatuses,'hardware_status_name']].map(([key,label,items,name]) => <div className="space-y-2" key={key}><Label>{label}</Label><Select name={key} value={values[key]} onValueChange={(v) => update(key,v)} required><SelectTrigger className="w-full"><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger><SelectContent>{items.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item[name]}</SelectItem>)}</SelectContent></Select>{errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}</div>)}<DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button>Submit for verification</Button></DialogFooter></form></DialogContent></Dialog></Layout>;
}
