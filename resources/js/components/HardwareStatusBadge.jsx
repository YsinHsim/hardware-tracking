import React from "react";
import { Badge } from "@/components/ui/badge";

const styles = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    "in store": "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
    "under repair": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    faulty: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    retired: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
};

const dots = {
    active: "bg-emerald-500",
    "in store": "bg-sky-500",
    "under repair": "bg-amber-500",
    faulty: "bg-rose-500",
    retired: "bg-slate-400",
};

export default function HardwareStatusBadge({ status }) {
    const label = status || "Unknown Status";
    const key = label.toLowerCase();

    return (
        <Badge variant="outline" className={styles[key] ?? styles.retired}>
            <span className={`size-1.5 rounded-full ${dots[key] ?? dots.retired}`} aria-hidden="true" />
            {label}
        </Badge>
    );
}
