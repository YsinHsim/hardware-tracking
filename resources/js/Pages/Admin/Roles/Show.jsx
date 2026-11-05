import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { PermissionGroups } from "@/components/PermissionGroups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeRise, spring } from "@/lib/motion";

export default function RoleShow({ role, permissions, isBaseRole }) {
    const isSuperadmin = role.name === "superadmin";
    const [selected, setSelected] = useState(() => new Set(role.permissions));

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

    const dirty =
        selected.size !== role.permissions.length ||
        role.permissions.some((p) => !selected.has(p));

    function handleSave() {
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
                                <Button onClick={handleSave} disabled={!dirty}>
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
        </Layout>
    );
}
