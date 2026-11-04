import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const emptyUser = { user_name: "", user_position_id: "", estate_id: "" };

export default function Create({ positions, estates, users }) {
    const [values, setValues] = useState(emptyUser);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function updateField(field, value) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => {
            if (!current[field]) return current;
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    function handleSubmit(event) {
        event.preventDefault();
        setProcessing(true);
        router.post("/users", values, {
            onSuccess: () => {
                setValues(emptyUser);
                setErrors({});
                toast.success("New user created successfully!");
            },
            onError: (validationErrors) => {
                setErrors(validationErrors);
                toast.error("Please fix the highlighted fields.");
            },
            onFinish: () => setProcessing(false),
        });
    }

    const recentUsers = [...users]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
    const fieldError = (field) => errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>;

    return (
        <Layout>
            <div className="mx-auto max-w-2xl">
                <PageHeader
                    icon={ UserPlus }
                    title="Users"
                    description="Create an assigned hardware user."
                />
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Create user</CardTitle>
                        <CardDescription>Assign a name, position and estate.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentUsers.length > 0 && (
                            <div className="mb-5">
                                <p className="mb-2 text-sm font-medium">Recently created</p>
                                <div className="flex flex-wrap gap-2">
                                    {recentUsers.map((user) => <Button key={user.id} variant="outline" size="sm" asChild><Link href={`/users/${user.id}`}>{user.user_name}</Link></Button>)}
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="user_name">Name</Label>
                                <Input id="user_name" value={values.user_name} onChange={(event) => updateField("user_name", event.target.value)} aria-invalid={Boolean(errors.user_name)} required />
                                {fieldError("user_name")}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user_position_id">Position</Label>
                                <Select name="user_position_id" value={String(values.user_position_id)} onValueChange={(value) => updateField("user_position_id", value)} required>
                                    <SelectTrigger id="user_position_id" className="w-full" aria-invalid={Boolean(errors.user_position_id)}><SelectValue placeholder="Select position" /></SelectTrigger>
                                    <SelectContent>
                                        {positions.map((position) => <SelectItem key={position.id} value={String(position.id)}>{position.position_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {fieldError("user_position_id")}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estate_id">Estate</Label>
                                <Select name="estate_id" value={String(values.estate_id)} onValueChange={(value) => updateField("estate_id", value)} required>
                                    <SelectTrigger id="estate_id" className="w-full" aria-invalid={Boolean(errors.estate_id)}><SelectValue placeholder="Select estate" /></SelectTrigger>
                                    <SelectContent>
                                        {estates.map((estate) => <SelectItem key={estate.id} value={String(estate.id)}>{estate.estate_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {fieldError("estate_id")}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>{processing ? "Creating…" : "Create"}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
