import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Onboarding({ user, branches, positions }) {
    const { errors } = usePage().props;
    const [values, setValues] = useState({ name: user.name, password: "", password_confirmation: "", branch_id: "", user_position_id: "" });
    const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
    function submit(event) {
        event.preventDefault();
        router.put('/onboarding', values);
    }
    const error = (key) => errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>;
    return <main className="min-h-screen bg-muted px-4 py-10"><Head title="Complete your profile" /><Card className="mx-auto w-full max-w-xl"><CardHeader><CardTitle>Complete your profile</CardTitle><CardDescription>Required before accessing AssetHub. Choose your own password and confirm your work details.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label>Email</Label><Input value={user.email} disabled /></div><div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" value={values.name} onChange={(e) => update('name', e.target.value)} required />{error('name')}</div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>New password</Label><Input type="password" value={values.password} onChange={(e) => update('password', e.target.value)} required />{error('password')}</div><div className="space-y-2"><Label>Confirm password</Label><Input type="password" value={values.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)} required /></div></div><div className="space-y-2"><Label>Branch</Label><Select name="branch_id" value={values.branch_id} onValueChange={(v) => update('branch_id', v)} required><SelectTrigger className="w-full"><SelectValue placeholder="Select branch" /></SelectTrigger><SelectContent>{branches.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.branch_name}</SelectItem>)}</SelectContent></Select>{error('branch_id')}</div><div className="space-y-2"><Label>Position</Label><Select name="user_position_id" value={values.user_position_id} onValueChange={(v) => update('user_position_id', v)} required><SelectTrigger className="w-full"><SelectValue placeholder="Select position" /></SelectTrigger><SelectContent>{positions.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.position_name}</SelectItem>)}</SelectContent></Select>{error('user_position_id')}</div><Button className="w-full">Save profile and continue</Button></form></CardContent></Card></main>;
}
