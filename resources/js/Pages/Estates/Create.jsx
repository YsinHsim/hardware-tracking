import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
import { MapPinned } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const emptyEstate = { estate_name: "", region_id: "" };

export default function Create({ estates, regions }) {
    const [estateValues, setEstateValues] = useState(emptyEstate);
    const [estateErrors, setEstateErrors] = useState({});
    const [creatingEstate, setCreatingEstate] = useState(false);
    const [regionValues, setRegionValues] = useState({ region_name: "" });
    const [regionErrors, setRegionErrors] = useState({});
    const [creatingRegion, setCreatingRegion] = useState(false);

    function updateField(field, value) {
        setEstateValues((values) => ({ ...values, [field]: value }));
        setEstateErrors((current) => {
            if (!current[field]) return current;
            const next = { ...current };
            delete next[field];
            return next;
        });
    }

    function updateRegion(value) {
        setRegionValues({ region_name: value });
        setRegionErrors({});
    }

    function handleSubmitEstate(event) {
        event.preventDefault();
        setCreatingEstate(true);
        router.post("/estates", estateValues, {
            onSuccess: () => {
                setEstateValues(emptyEstate);
                setEstateErrors({});
                toast.success("New estate created successfully!");
            },
            onError: (errors) => {
                setEstateErrors(errors);
                toast.error("Please fix the highlighted fields.");
            },
            onFinish: () => setCreatingEstate(false),
        });
    }

    function handleSubmitRegion(event) {
        event.preventDefault();
        setCreatingRegion(true);
        router.post("/regions", regionValues, {
            onSuccess: () => {
                setRegionValues({ region_name: "" });
                setRegionErrors({});
                toast.success("New region created successfully!");
            },
            onError: (errors) => {
                setRegionErrors(errors);
                toast.error("Please fix the highlighted fields.");
            },
            onFinish: () => setCreatingRegion(false),
        });
    }

    const recentEstates = [...estates]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

    return (
        <Layout>
            <PageHeader
                icon={ MapPinned }
                title="Estates"
                description="Create an estate or a region."
            backHref="/estates"
                    backLabel="Back to estates"
                />

            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">New estate</CardTitle>
                        <CardDescription>Add an estate to an existing region.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentEstates.length > 0 && (
                            <div className="mb-5">
                                <p className="mb-2 text-sm font-medium">Recently created</p>
                                <div className="flex flex-wrap gap-2">
                                    {recentEstates.map((estate) => <Badge key={estate.id} variant="outline">{estate.estate_name}</Badge>)}
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSubmitEstate} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="estate_name">Estate name</Label>
                                <Input id="estate_name" value={estateValues.estate_name} onChange={(event) => updateField("estate_name", event.target.value)} aria-invalid={Boolean(estateErrors.estate_name)} required />
                                {estateErrors.estate_name && <p className="text-sm text-destructive">{estateErrors.estate_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="region_id">Region</Label>
                                <Select name="region_id" value={String(estateValues.region_id)} onValueChange={(value) => updateField("region_id", value)} required disabled={regions.length === 0}>
                                    <SelectTrigger id="region_id" className="w-full" aria-invalid={Boolean(estateErrors.region_id)}>
                                        <SelectValue placeholder={regions.length === 0 ? "Create a region first" : "Select region"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regions.map((region) => <SelectItem key={region.id} value={String(region.id)}>{region.region_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {estateErrors.region_id && <p className="text-sm text-destructive">{estateErrors.region_id}</p>}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={creatingEstate || regions.length === 0}>{creatingEstate ? "Creating…" : "Create"}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">New region</CardTitle>
                        <CardDescription>Create a region to use when adding estates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {regions.length > 0 && (
                            <div className="mb-5">
                                <p className="mb-2 text-sm font-medium">Regions</p>
                                <div className="flex flex-wrap gap-2">
                                    {regions.map((region) => <Badge key={region.id} variant="outline">{region.region_name}</Badge>)}
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSubmitRegion} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="region_name">Region name</Label>
                                <Input id="region_name" value={regionValues.region_name} onChange={(event) => updateRegion(event.target.value)} aria-invalid={Boolean(regionErrors.region_name)} required />
                                {regionErrors.region_name && <p className="text-sm text-destructive">{regionErrors.region_name}</p>}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={creatingRegion}>{creatingRegion ? "Creating…" : "Create"}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
