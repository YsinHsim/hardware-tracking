import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import { SquarePen } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Edit({ user, branches, positions }) {
    const [userValues, setUserValues] = useState({
        user_name: user.user_name,
        user_position_id: user.user_position_id || "",
        estate_id: user.estate_id || "",
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function updateField(field, value) {
        setUserValues((values) => ({ ...values, [field]: value }));
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
        router.put(`/users/${user.id}`, userValues, {
            onSuccess: () => {
                setErrors({});
                toast.success("User updated successfully!");
            },
            onError: (validationErrors) => {
                setErrors(validationErrors);
                toast.error("Please fix the highlighted fields.");
            },
            onFinish: () => setProcessing(false),
        });
    }

    const fieldError = (field) => errors[field] && <p className="text-sm text-destructive">{errors[field]}</p>;

    return (
        <Layout>
            <div className="mx-auto max-w-2xl">
                <PageHeader
                    icon={ SquarePen }
                    title="Users"
                    description="Edit and update assigned user data."
                backHref={`/users/${user.id}`}
                    backLabel="Back to user details"
                />
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Edit user</CardTitle>
                        <CardDescription>Update {user.user_name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="user_name">Name</Label>
                                <Input id="user_name" value={userValues.user_name} onChange={(event) => updateField("user_name", event.target.value)} aria-invalid={Boolean(errors.user_name)} required />
                                {fieldError("user_name")}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user_position_id">Position</Label>
                                <Select name="user_position_id" value={String(userValues.user_position_id)} onValueChange={(value) => updateField("user_position_id", value)} required>
                                    <SelectTrigger id="user_position_id" className="w-full" aria-invalid={Boolean(errors.user_position_id)}><SelectValue placeholder="Select position" /></SelectTrigger>
                                    <SelectContent>
                                        {positions.map((position) => <SelectItem key={position.id} value={String(position.id)}>{position.position_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {fieldError("user_position_id")}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estate_id">Branch</Label>
                                <Select name="estate_id" value={String(userValues.estate_id)} onValueChange={(value) => updateField("estate_id", value)} required>
                                    <SelectTrigger id="estate_id" className="w-full" aria-invalid={Boolean(errors.estate_id)}><SelectValue placeholder="Select branch" /></SelectTrigger>
                                    <SelectContent>
                                        {estates.map((estate) => <SelectItem key={estate.id} value={String(estate.id)}>{estate.estate_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {fieldError("estate_id")}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>{processing ? "Updating…" : "Update"}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
