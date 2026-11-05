import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { ShieldCheck } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeRise, spring } from "@/lib/motion";

export default function RoleShow({ role, permissions, isBaseRole }) {
    const isSuperadmin = role.name === "superadmin";
    const [selected, setSelected] = useState(() => new Set(role.permissions));
    const [confirmOpen, setConfirmOpen] = useState(false);

    React.useEffect(() => {
        setSelected(new Set(role.permissions));
    }, [role.id, role.permissions]);

    const toggle = (permission) => {
        if (isSuperadmin) return;
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(permission)) next.delete(permission);
            else next.add(permission);
            return next;
        });
    };

    const toggleGroup = (groupPermissions) => {
        if (isSuperadmin) return;
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

    const added = Array.from(selected).filter((p) => !role.permissions.includes(p)).sort();
    const removed = role.permissions.filter((p) => !selected.has(p)).sort();
    const dirty = added.length > 0 || removed.length > 0;

    function handleConfirm() {
        setConfirmOpen(false);
        router.put(
            `/admin/roles/${role.id}`,
            { permissions: Array.from(selected) },
            {
                onSuccess: () => toast.success(`Permissions for ${role.name} updated.`),
                onError: () => toast.error("Could not update permissions."),
                preserveState: true,
            }
        );
    }

    return (
        <Layout>
            <Head title={`Role: ${role.name}`} />
            <PageHeader
                icon={ShieldCheck}
                title={role.name}
                description={`${role.users_count} user${role.users_count === 1 ? "" : "s"} with this role.`}
                backHref="/admin/roles"
                backLabel="Back to roles"
            />

            <motion.div variants={fadeRise} initial="hidden" animate="show" transition={spring}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    Permissions
                                    {isBaseRole && <Badge variant="secondary">base role</Badge>}
                                </CardTitle>
                                <CardDescription>
                                    {isSuperadmin
                                        ? "Superadmin always has full access — permissions cannot be edited."
                                        : "Toggle what this role can do, then save."}
                                </CardDescription>
                            </div>
                            {!isSuperadmin && (
                                <Button onClick={() => setConfirmOpen(true)} disabled={!dirty}>
                                    Save changes
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <PermissionGroups
                            groups={permissions}
                            selected={selected}
                            onToggle={toggle}
                            onToggleGroup={toggleGroup}
                            disabled={isSuperadmin}
                        />
                    </CardContent>
                </Card>
            </motion.div>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apply these changes to {role.name}?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    {role.users_count} user{role.users_count === 1 ? "" : "s"} with this role
                                    will be affected immediately.
                                </p>
                                {added.length > 0 && (
                                    <div>
                                        <p className="mb-1 font-medium text-emerald-600 dark:text-emerald-400">
                                            Granted ({added.length})
                                        </p>
                                        <ul className="space-y-0.5 font-mono text-xs">
                                            {added.map((p) => <li key={p}>+ {p}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {removed.length > 0 && (
                                    <div>
                                        <p className="mb-1 font-medium text-destructive">
                                            Revoked ({removed.length})
                                        </p>
                                        <ul className="space-y-0.5 font-mono text-xs">
                                            {removed.map((p) => <li key={p}>− {p}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>Yes, apply changes</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
}
