import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/PageHeader";
import Layout from "@/Pages/Layouts/Layout";

const initialForm = {
    current_password: "",
    password: "",
    password_confirmation: "",
};

export default function ChangePassword() {
    const { errors, flash } = usePage().props;
    const [form, setForm] = useState(initialForm);
    const [fieldErrors, setFieldErrors] = useState({});

    React.useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            setForm(initialForm);
            setFieldErrors({});
        }
    }, [flash?.success]);

    const setField = (name) => (event) => {
        setForm((prev) => ({ ...prev, [name]: event.target.value }));
        setFieldErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    function handleSubmit(event) {
        event.preventDefault();

        const clientErrors = {};
        if (!form.current_password) clientErrors.current_password = "The current password field is required.";
        if (!form.password) clientErrors.password = "The new password field is required.";
        if (form.password !== form.password_confirmation) {
            clientErrors.password_confirmation = "The new password confirmation does not match.";
        }

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            toast.error("Please fix the highlighted fields.");
            return;
        }

        router.put("/settings/password", form, {
            onError: () => toast.error("Please fix the highlighted fields."),
            preserveState: true,
        });
    }

    return (
        <Layout>
            <Head title="Change password" />
            <PageHeader
                title="Change password"
                description="Update the password you use to sign in to AssetHub."
                icon={KeyRound}
            />

            <Card className="max-w-lg">
                <CardHeader>
                    <CardTitle className="text-base">Password</CardTitle>
                    <CardDescription>
                        Choose a new password. You will stay signed in on this device.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_password">Current password</Label>
                            <Input
                                id="current_password"
                                type="password"
                                value={form.current_password}
                                onChange={setField("current_password")}
                                autoComplete="current-password"
                                aria-invalid={Boolean(fieldErrors.current_password || errors.current_password)}
                                required
                            />
                            {(fieldErrors.current_password || errors.current_password) && (
                                <p className="text-sm text-destructive">
                                    {fieldErrors.current_password || errors.current_password}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">New password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={setField("password")}
                                autoComplete="new-password"
                                aria-invalid={Boolean(fieldErrors.password || errors.password)}
                                required
                            />
                            {(fieldErrors.password || errors.password) && (
                                <p className="text-sm text-destructive">{fieldErrors.password || errors.password}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm new password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={form.password_confirmation}
                                onChange={setField("password_confirmation")}
                                autoComplete="new-password"
                                aria-invalid={Boolean(
                                    fieldErrors.password_confirmation || errors.password_confirmation
                                )}
                                required
                            />
                            {(fieldErrors.password_confirmation || errors.password_confirmation) && (
                                <p className="text-sm text-destructive">
                                    {fieldErrors.password_confirmation || errors.password_confirmation}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Save new password</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </Layout>
    );
}
