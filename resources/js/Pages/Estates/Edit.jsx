import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Edit({ estate, regions }) {
    const [estateValues, setEstateValues] = useState({
        estate_name: estate.estate_name,
        region_id: estate.region_id,
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
        router.put(`/estates/${estate.id}`, estateValues, {
            onSuccess: () => {
                setErrors({});
                toast.success("Estate updated successfully!");
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
                <div className="mb-6">
                    <h1 className="font-heading text-3xl font-semibold">Estates</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Edit and update estate data.</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Edit estate</CardTitle>
                        <CardDescription>Update {estate.estate_name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="estate_name">Estate name</Label>
                                <Input id="estate_name" value={estateValues.estate_name} onChange={(event) => updateField("estate_name", event.target.value)} aria-invalid={Boolean(errors.estate_name)} required />
                                {errors.estate_name && <p className="text-sm text-destructive">{errors.estate_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="region_id">Region</Label>
                                <Select name="region_id" value={String(estateValues.region_id)} onValueChange={(value) => updateField("region_id", value)} required>
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
