import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import { Building2, SquarePen } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Edit({ branch, regions }) {
    const [branchValues, setEstateValues] = useState({
        branch_name: branch.branch_name,
        region_id: branch.region_id,
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    function updateField(field, value) {
        setEstateValues((values) => ({ ...values, [field]: value }));
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
        router.put(`/branches/${branch.id}`, branchValues, {
            onSuccess: () => {
                setErrors({});
                toast.success("Branch updated successfully!");
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
                    icon={ Building2 }
                    title="Branches"
                    description="Edit and update branch data."
                backHref="/branches"
                    backLabel="Back to branches"
                />
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Edit branch</CardTitle>
                        <CardDescription>Update {branch.branch_name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="branch_name">Branch name</Label>
                                <Input id="branch_name" value={branchValues.branch_name} onChange={(event) => updateField("branch_name", event.target.value)} aria-invalid={Boolean(errors.branch_name)} required />
                                {errors.branch_name && <p className="text-sm text-destructive">{errors.branch_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="region_id">Region</Label>
                                <Select name="region_id" value={String(branchValues.region_id)} onValueChange={(value) => updateField("region_id", value)} required>
                                    <SelectTrigger id="region_id" className="w-full" aria-invalid={Boolean(errors.region_id)}><SelectValue placeholder="Select region" /></SelectTrigger>
                                    <SelectContent>
                                        {regions.map((region) => <SelectItem key={region.id} value={String(region.id)}>{region.region_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.region_id && <p className="text-sm text-destructive">{errors.region_id}</p>}
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
