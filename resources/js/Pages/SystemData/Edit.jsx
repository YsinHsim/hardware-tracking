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

const fieldsByType = {
    user_positions: [
        { key: "position_name", label: "Name" },
        { key: "position_desc", label: "Description" },
    ],
    hardware_statuses: [
        { key: "hardware_status_name", label: "Name" },
    ],
    hardware_types: [
        { key: "hardware_type_name", label: "Name" },
        { key: "hardware_type_desc", label: "Description" },
    ],
};

export default function Edit({ type, record }) {
    const fields = fieldsByType[type];
    const [recordValues, setRecordValues] = useState(() => Object.fromEntries(
        fields.map(({ key }) => [key, record[key] ?? ""])
    ));
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function updateField(field, value) {
        setRecordValues((values) => ({ ...values, [field]: value }));
        setErrors((current) => {
            if (!current[field]) return current;
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    function handleSubmit(event) {
        event.preventDefault();
        const updatedValues = Object.keys(recordValues).reduce((values, key) => {
            if (recordValues[key] !== (record[key] ?? "")) values[key] = recordValues[key];
            return values;
        }, {});

        if (Object.keys(updatedValues).length === 0) {
            toast.warning("No changes detected.");
            return;
        }

        setProcessing(true);
        router.put(`/system-data/${type}/${record.id}`, updatedValues, {
            onSuccess: () => {
                setErrors({});
                toast.success(`${type.replaceAll("_", " ")} updated successfully!`);
            },
            onError: (validationErrors) => {
                setErrors(validationErrors);
                toast.error("Please fix the highlighted fields.");
            },
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Layout>
            <div className="mx-auto max-w-2xl">
                <PageHeader
                    icon={ SquarePen }
                    title="System Data"
                    description="Edit and update system data."
                />
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Edit {recordValues[fields[0].key]}</CardTitle>
                        <CardDescription>Update the editable fields for this record.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {fields.map(({ key, label }) => (
                                <div key={key} className="space-y-2">
                                    <Label htmlFor={key}>{label}</Label>
                                    <Input id={key} value={recordValues[key]} onChange={(event) => updateField(key, event.target.value)} aria-invalid={Boolean(errors[key])} required={label === "Name"} />
                                    {errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}
                                </div>
                            ))}
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
