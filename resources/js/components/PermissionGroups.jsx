import React from "react";
import { Building2, Database, Monitor, ShieldCheck, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const MODULE_META = {
    hardware: { label: "Hardware", icon: Monitor, iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
    users: { label: "Users (hardware assignees)", icon: Users, iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    branches: { label: "Branches", icon: Building2, iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    "system-data": { label: "System Data", icon: Database, iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    admin: { label: "Administration", icon: ShieldCheck, iconClass: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

// Module cards with icon headers and toggleable permission pills.
// `selected` is a Set of permission names.
export function PermissionGroups({ groups, selected, onToggle, onToggleGroup, disabled = false }) {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Object.entries(groups).map(([module, permissions]) => {
                const meta = MODULE_META[module] ?? { label: module, icon: ShieldCheck, iconClass: "bg-muted text-muted-foreground" };
                const Icon = meta.icon;
                const allChecked = permissions.every((p) => selected.has(p));
                const someChecked = !allChecked && permissions.some((p) => selected.has(p));
                const checkedCount = disabled ? permissions.length : permissions.filter((p) => selected.has(p)).length;

                return (
                    <section key={module} className="rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-3 border-b border-border p-4">
                            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", meta.iconClass)}>
                                <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-semibold">{meta.label}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {checkedCount} of {permissions.length} enabled
                                </p>
                            </div>
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Checkbox
                                    checked={disabled ? true : someChecked ? "indeterminate" : allChecked}
                                    disabled={disabled}
                                    onCheckedChange={() => onToggleGroup(permissions)}
                                    aria-label={`Toggle all ${module} permissions`}
                                />
                                All
                            </label>
                        </div>
                        <div className="flex flex-wrap gap-2 p-4">
                            {permissions.map((permission) => {
                                const action = permission.split(".", 2)[1] ?? permission;
                                const active = disabled || selected.has(permission);
                                return (
                                    <button
                                        key={permission}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onToggle(permission)}
                                        aria-pressed={active}
                                        aria-label={permission}
                                        className={cn(
                                            "rounded-full border px-3 py-1 font-mono text-xs transition-colors",
                                            active
                                                ? "border-primary/40 bg-primary/10 text-primary"
                                                : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                                            disabled && "cursor-default opacity-80"
                                        )}
                                    >
                                        {action}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
