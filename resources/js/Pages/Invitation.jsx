import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Invitation({ token }) {
    const { errors } = usePage().props;
    const [email, setEmail] = useState("");
    function submit(event) {
        event.preventDefault();
        router.post(`/invitation/${token}`, { email });
    }
    return <main className="flex min-h-screen items-center justify-center bg-muted p-4"><Head title="Accept invitation" /><Card className="w-full max-w-md"><CardHeader><CardTitle>Welcome to AssetHub</CardTitle><CardDescription>Confirm your invited email to continue. This link can only be used once.</CardDescription></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />{errors.email && <p className="text-sm text-destructive">{errors.email}</p>}</div><Button className="w-full">Continue to profile setup</Button></form></CardContent></Card></main>;
}
