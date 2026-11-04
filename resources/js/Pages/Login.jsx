import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { fadeRise, spring } from "@/lib/motion";

export default function Login() {
    const { errors } = usePage().props;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = (event) => {
        event.preventDefault();
        setLoading(true);
        router.post(
            "/login",
            { email, password, remember },
            { onFinish: () => setLoading(false) }
        );
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
            <Head title="Log in" />
            <div className="absolute top-4 right-4"><ThemeToggle /></div>
            <motion.div
                variants={fadeRise}
                initial="hidden"
                animate="show"
                transition={spring}
                className="w-full max-w-sm"
            >
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Hardware Tracking</CardTitle>
                        <CardDescription>Sign in to manage your organisation's hardware.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Enter your email"
                                    autoComplete="username"
                                    aria-invalid={Boolean(errors.email)}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    aria-invalid={Boolean(errors.password)}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={remember}
                                    onCheckedChange={(checked) => setRemember(checked === true)}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Signing in…" : "Log in"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
