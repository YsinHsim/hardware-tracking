import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

const MODULE_LABELS = {
    hardware: "Hardware",
    users: "Users (hardware assignees)",
    branches: "Branches",
    "system-data": "System Data",
    admin: "Administration",
};

// Renders permissions grouped by module. Each group gets a header and a
// select-all toggle. `selected` is a Set of permission names.
export function PermissionGroups({ groups, selected, onToggle, onToggleGroup, disabled = false }) {
    return (
        <div className="space-y-6">
            {Object.entries(groups).map(([module, permissions]) => {
                const allChecked = permissions.every((p) => selected.has(p));
                const someChecked = !allChecked && permissions.some((p) => selected.has(p));

                return (
                    <section key={module}>
                        <div className="mb-2 flex items-center justify-between gap-2 border-b border-border pb-2">
                            <h3 className="text-sm font-semibold">
                                {MODULE_LABELS[module] ?? module}
                            </h3>
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Checkbox
                                    checked={disabled ? true : someChecked ? "indeterminate" : allChecked}
                                    disabled={disabled}
                                    onCheckedChange={() => onToggleGroup(permissions)}
                                    aria-label={`Toggle all ${module} permissions`}
                                />
                                All
                            </label>
                        </div>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
                            {permissions.map((permission) => {
                                const action = permission.split(".", 2)[1] ?? permission;
                                return (
                                    <label
                                        key={permission}
                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                    >
                                        <Checkbox
                                            checked={disabled || selected.has(permission)}
                                            disabled={disabled}
                                            onCheckedChange={() => onToggle(permission)}
                                            aria-label={permission}
                                        />
                                        <span className="font-mono text-xs">{action}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
