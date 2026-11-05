import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { UsersRound } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fadeRise, spring } from "@/lib/motion";

export default function AdminUsersIndex({ users, roles }) {
    const { errors } = usePage().props;
    const [selection, setSelection] = useState({});

    const assign = (user) => {
        const role = selection[user.id] ?? user.role;
        if (!role) return;
        router.put(
            `/admin/users/${user.id}/role`,
            { role },
            {
                onSuccess: () => toast.success(`${user.name} is now ${role}.`),
                onError: () => toast.error("Could not change role."),
                preserveState: true,
            }
        );
    };

    return (
        <Layout>
            <Head title="User accounts" />
            <PageHeader
                icon={UsersRound}
                title="User accounts"
                description="Login accounts and their access role."
            />

            {errors.role && (
                <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errors.role}
                </p>
            )}

            <motion.div variants={fadeRise} initial="hidden" animate="show" transition={spring}>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="w-48">Role</TableHead>
                                    <TableHead className="w-24 text-right">Save</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={selection[user.id] ?? user.role ?? "none"}
                                                onValueChange={(value) =>
                                                    setSelection((prev) => ({ ...prev, [user.id]: value }))
                                                }
                                            >
                                                <SelectTrigger aria-label={`Role for ${user.name}`}>
                                                    <SelectValue placeholder="No role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {user.role === null && (
                                                        <SelectItem value="none" disabled>No role</SelectItem>
                                                    )}
                                                    {roles.map((role) => (
                                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={(selection[user.id] ?? user.role) === user.role}
                                                onClick={() => assign(user)}
                                            >
                                                Save
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </Layout>
    );
}
