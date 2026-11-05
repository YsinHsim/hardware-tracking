import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { fadeRise, spring } from "@/lib/motion";

const BASE_ROLES = ["superadmin", "manager", "staff"];

function PermissionMatrix({ role, allPermissions, disabled, onSave }) {
    const [selected, setSelected] = useState(() => new Set(role.permissions));

    React.useEffect(() => {
        setSelected(new Set(role.permissions));
    }, [role.id, role.permissions]);

    const toggle = (permission) => {
        if (disabled) return;
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(permission)) next.delete(permission);
            else next.add(permission);
            return next;
        });
    };

    const dirty =
        selected.size !== role.permissions.length ||
        role.permissions.some((p) => !selected.has(p));

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {role.name}
                            <Badge variant="secondary">{role.users_count} users</Badge>
                        </CardTitle>
                        <CardDescription>
                            {disabled
                                ? "Superadmin always has full access."
                                : "Toggle what this role can do."}
                        </CardDescription>
                    </div>
                    {!disabled && (
                        <Button
                            size="sm"
                            disabled={!dirty}
                            onClick={() =>
                                onSave(role, Array.from(selected), () => setSelected(new Set(role.permissions)))
                            }
                        >
                            Save changes
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                    {allPermissions.map((permission) => (
                        <label
                            key={permission}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                        >
                            <Checkbox
                                checked={disabled || selected.has(permission)}
                                disabled={disabled}
                                onCheckedChange={() => toggle(permission)}
                                aria-label={permission}
                            />
                            <span className="font-mono text-xs">{permission}</span>
                        </label>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function CreateRoleCard({ allPermissions }) {
    const { errors } = usePage().props;
    const [name, setName] = useState("");
    const [selected, setSelected] = useState(new Set());

    const toggle = (permission) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(permission)) next.delete(permission);
            else next.add(permission);
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
                    setName("");
                    setSelected(new Set());
                },
                onError: () => toast.error("Please fix the highlighted fields."),
                preserveState: true,
            }
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Create a new role</CardTitle>
                <CardDescription>Lowercase letters, numbers and dashes (e.g. technician).</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Role name</Label>
                        <Input
                            id="role-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="technician"
                            aria-invalid={Boolean(errors.name)}
                            required
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Initial permissions</Label>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                            {allPermissions.map((permission) => (
                                <label
                                    key={permission}
                                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                >
                                    <Checkbox
                                        checked={selected.has(permission)}
                                        onCheckedChange={() => toggle(permission)}
                                        aria-label={permission}
                                    />
                                    <span className="font-mono text-xs">{permission}</span>
                                </label>
                            ))}
                        </div>
                        {errors.permissions && (
                            <p className="text-sm text-destructive">{errors.permissions}</p>
                        )}
                    </div>
                    <Button type="submit">
                        <Plus /> Create role
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function UserAssignmentCard({ users, roles }) {
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
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Assign roles to users</CardTitle>
                <CardDescription>Each user has exactly one role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Select
                            value={selection[user.id] ?? user.role ?? "none"}
                            onValueChange={(value) =>
                                setSelection((prev) => ({ ...prev, [user.id]: value }))
                            }
                        >
                            <SelectTrigger className="w-40" aria-label={`Role for ${user.name}`}>
                                <SelectValue placeholder="No role" />
                            </SelectTrigger>
                            <SelectContent>
                                {user.role === null && <SelectItem value="none" disabled>No role</SelectItem>}
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.name}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={(selection[user.id] ?? user.role) === user.role}
                            onClick={() => assign(user)}
                        >
                            Save
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function RolesIndex({ roles, permissions, users }) {
    const [deleteTarget, setDeleteTarget] = useState(null);

    function savePermissions(role, perms) {
        router.put(
            `/admin/roles/${role.id}`,
            { permissions: perms },
            {
                onSuccess: () => toast.success(`Permissions for ${role.name} updated.`),
                onError: () => toast.error("Could not update permissions."),
                preserveState: true,
            }
        );
    }

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
            />

            <motion.div variants={fadeRise} initial="hidden" animate="show" transition={spring} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <CreateRoleCard allPermissions={permissions} />
                    <UserAssignmentCard users={users} roles={roles} />
                </div>

                <Separator />

                {roles.map((role) => (
                    <div key={role.id} className="space-y-2">
                        <PermissionMatrix
                            role={role}
                            allPermissions={permissions}
                            disabled={role.name === "superadmin"}
                            onSave={savePermissions}
                        />
                        {!BASE_ROLES.includes(role.name) && (
                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setDeleteTarget(role)}
                                >
                                    <Trash2 /> Delete {role.name}
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </motion.div>

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
