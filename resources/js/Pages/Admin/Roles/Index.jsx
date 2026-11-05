import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { PermissionGroups } from "@/components/PermissionGroups";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fadeRise, spring } from "@/lib/motion";

const BASE_ROLES = ["superadmin", "manager", "staff"];

function CreateRoleDialog({ open, onOpenChange, allPermissions }) {
    const { errors } = usePage().props;
    const [name, setName] = useState("");
    const [selected, setSelected] = useState(new Set());

    React.useEffect(() => {
        if (!open) {
            setName("");
            setSelected(new Set());
        }
    }, [open]);

    const toggle = (permission) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(permission)) next.delete(permission);
            else next.add(permission);
            return next;
        });
    };

    const toggleGroup = (groupPermissions) => {
        setSelected((prev) => {
            const next = new Set(prev);
            const allChecked = groupPermissions.every((p) => next.has(p));
            groupPermissions.forEach((p) => {
                if (allChecked) next.delete(p);
                else next.add(p);
            });
            return next;
        });
    };

    function handleSubmit(event) {
        event.preventDefault();
        router.post(
            "/admin/roles",
            { name, permissions: Array.from(selected) },
            {
                onSuccess: () => {
                    toast.success("Role created.");
                    onOpenChange(false);
                },
                onError: () => toast.error("Please fix the highlighted fields."),
                preserveState: true,
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
                <DialogHeader className="border-b border-border px-6 py-5 pr-12">
                    <DialogTitle>Create a new role</DialogTitle>
                    <DialogDescription>
                        Give the role a clear name, then choose the access it needs.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="space-y-2 px-6 py-5">
                        <Label htmlFor="role-name">Role name</Label>
                        <Input
                            id="role-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. technician"
                            aria-invalid={Boolean(errors.name)}
                            required
                        />
                        {errors.name ? (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        ) : (
                            <p className="text-xs text-muted-foreground">Use lowercase letters, numbers and dashes.</p>
                        )}
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col px-6 pb-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <Label>Initial permissions</Label>
                            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                            <PermissionGroups
                                groups={allPermissions}
                                selected={selected}
                                onToggle={toggle}
                                onToggleGroup={toggleGroup}
                                compact
                            />
                        </div>
                    </div>
                    <DialogFooter className="m-0 shrink-0 px-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create role</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function RolesIndex({ roles, permissions }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/admin/roles/${deleteTarget.id}`, {
            onSuccess: () => {
                toast.success("Role deleted.");
                setDeleteTarget(null);
            },
            onError: (errs) => {
                if (errs.delete) toast.error(errs.delete);
                setDeleteTarget(null);
            },
            preserveState: true,
        });
    }

    return (
        <Layout>
            <Head title="Roles & Access" />
            <PageHeader
                icon={ShieldCheck}
                title="Roles & Access"
                description="Create user types and control what each can do."
                actions={
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus /> New role
                    </Button>
                }
            />

            <motion.div variants={fadeRise} initial="hidden" animate="show" transition={spring}>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="w-32">Users</TableHead>
                                    <TableHead className="w-40">Permissions</TableHead>
                                    <TableHead className="w-28 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                href={`/admin/roles/${role.id}`}
                                                className="hover:underline"
                                            >
                                                {role.name}
                                            </Link>
                                            {BASE_ROLES.includes(role.name) && (
                                                <Badge variant="secondary" className="ml-2">base</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{role.users_count}</TableCell>
                                        <TableCell>
                                            {role.name === "superadmin" ? (
                                                <span className="text-muted-foreground">All</span>
                                            ) : (
                                                role.permissions_count
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon-sm" asChild aria-label={`Edit ${role.name}`}>
                                                <Link href={`/admin/roles/${role.id}`}>
                                                    <Pencil />
                                                </Link>
                                            </Button>
                                            {!BASE_ROLES.includes(role.name) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteTarget(role)}
                                                    aria-label={`Delete ${role.name}`}
                                                >
                                                    <Trash2 />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>

            <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} allPermissions={permissions} />

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete role {deleteTarget?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Users with this role must be reassigned first. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
}
