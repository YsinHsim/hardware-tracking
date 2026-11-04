import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Edit({ hardware, hardwareTypes, hardwareStatuses, estates, assignedUsers }) {
    const [hardwareValues, setHardwareValues] = useState({
        hardware_no: hardware.hardware_no,
        hardware_serial_no: hardware.hardware_serial_no || "",
        assigned_user_id: hardware.assigned_user_id || "",
        hardware_type_id: hardware.hardware_type_id,
        hardware_status_id: hardware.hardware_status_id,
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function updateField(field, value) {
        setHardwareValues((values) => ({ ...values, [field]: value }));
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
        router.put(`/hardwares/${hardware.id}`, hardwareValues, {
            onSuccess: () => {
                setErrors({});
                toast.success("Hardware updated successfully!");
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
                <div className="mb-6">
                    <h1 className="font-heading text-3xl font-semibold">Hardware</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Edit and update hardware data.</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Edit hardware</CardTitle>
                        <CardDescription>Update <span className="font-mono">{hardware.hardware_no}</span>.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="hardware_no">Hardware number</Label>
                                <Input id="hardware_no" value={hardwareValues.hardware_no} onChange={(event) => updateField("hardware_no", event.target.value)} aria-invalid={Boolean(errors.hardware_no)} required />
                                {fieldError("hardware_no")}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hardware_serial_no">Serial number</Label>
                                <Input id="hardware_serial_no" value={hardwareValues.hardware_serial_no} onChange={(event) => updateField("hardware_serial_no", event.target.value)} aria-invalid={Boolean(errors.hardware_serial_no)} required />
                                {fieldError("hardware_serial_no")}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hardware_type_id">Hardware type</Label>
                                <Select name="hardware_type_id" value={String(hardwareValues.hardware_type_id)} onValueChange={(value) => updateField("hardware_type_id", value)} required>
                                    <SelectTrigger id="hardware_type_id" className="w-full" aria-invalid={Boolean(errors.hardware_type_id)}><SelectValue placeholder="Select hardware type" /></SelectTrigger>
                                    <SelectContent>
                                        {hardwareTypes.map((type) => <SelectItem key={type.id} value={String(type.id)}>{type.hardware_type_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {fieldError("hardware_type_id")}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hardware_status_id">Hardware status</Label>
                                <Select name="hardware_status_id" value={String(hardwareValues.hardware_status_id)} onValueChange={(value) => updateField("hardware_status_id", value)} required>
                                    <SelectTrigger id="hardware_status_id" className="w-full" aria-invalid={Boolean(errors.hardware_status_id)}><SelectValue placeholder="Select hardware status" /></SelectTrigger>
                                    <SelectContent>
                                        {hardwareStatuses.map((status) => <SelectItem key={status.id} value={String(status.id)}>{status.hardware_status_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {fieldError("hardware_status_id")}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="assigned_user_id">Assigned user</Label>
                                <Select value={hardwareValues.assigned_user_id === "" ? "none" : String(hardwareValues.assigned_user_id)} onValueChange={(value) => updateField("assigned_user_id", value === "none" ? "" : value)}>
                                    <SelectTrigger id="assigned_user_id" className="w-full" aria-invalid={Boolean(errors.assigned_user_id)}><SelectValue placeholder="Select assigned user" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Unassigned</SelectItem>
                                        {estates.map((estate) => (
                                            <SelectGroup key={estate.id}>
                                                <SelectLabel>{estate.estate_name}</SelectLabel>
                                                {assignedUsers[estate.id]?.map((user) => <SelectItem key={user.id} value={String(user.id)}>{user.user_name}</SelectItem>)}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldError("assigned_user_id")}
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
