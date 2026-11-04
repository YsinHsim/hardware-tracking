import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const placeholders = {
    user_positions: "Enter position name",
    hardware_statuses: "Enter hardware status",
    hardware_types: "Enter hardware type",
};

const labels = {
    user_positions: "Position name",
    hardware_statuses: "Hardware status",
    hardware_types: "Hardware type",
};

export default function Create({ type }) {
    const [name, setName] = useState("");
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const label = labels[type] || "Name";

    function updateName(value) {
        setName(value);
        setErrors({});
    }

    function handleSubmit(event) {
        event.preventDefault();
        setProcessing(true);
        router.post(`/system-data/${type}`, { name }, {
            onSuccess: () => {
                toast.success(`${label} created successfully!`);
                router.visit("/system-data");
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
                    icon={ PlusCircle }
                    title="System Data"
                    description="Create a new system data record."
                />
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">New {label.toLowerCase()}</CardTitle>
                        <CardDescription>Add a record for use throughout the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name">{label}</Label>
                                <Input id="name" value={name} onChange={(event) => updateName(event.target.value)} placeholder={placeholders[type] || "Enter name"} aria-invalid={Boolean(errors.name)} required />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
