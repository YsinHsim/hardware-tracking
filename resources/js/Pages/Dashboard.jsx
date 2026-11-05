import React from "react";
import { Head } from "@inertiajs/react";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { AlertTriangle, Boxes, Building2, LayoutDashboard, Link2, Unlink } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Layout from "./Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeRise, listStagger, spring } from "@/lib/motion";
import { useCountUp } from "@/lib/use-count-up";
import { cn } from "@/lib/utils";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function chartColors(count) {
    const tokens = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];
    return Array.from({ length: count }, (_, i) => cssVar(tokens[i % tokens.length]) || "#7c9cc4");
}

const statCards = [
    { key: "totalHardware", label: "Total hardware", icon: Boxes, iconClass: "bg-primary/10 text-primary" },
    { key: "assignedCount", label: "Assigned", icon: Link2, iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { key: "unassignedCount", label: "Unassigned", icon: Unlink, iconClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
    { key: "faultyCount", label: "Faulty", icon: AlertTriangle, iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { key: "totalBranches", label: "Branches", icon: Building2, iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
];

function StatCard({ card, index, value, caption }) {
    const Icon = card.icon;
    const count = useCountUp(value, { delay: 0.05 + index * listStagger.staggerChildren });

    return (
        <motion.div
            variants={fadeRise}
            initial="hidden"
            animate="show"
            transition={{ ...spring, delay: index * listStagger.staggerChildren }}
        >
            <Card size="sm" className="h-full">
                <CardContent className="flex items-center gap-3">
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", card.iconClass)}>
                        <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-sm text-muted-foreground">{card.label}</p>
                        <p className="font-heading text-2xl font-semibold tabular-nums">{count}</p>
                        {caption && (
                            <p className="truncate text-xs text-muted-foreground">{caption}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function FloatingEmptyState({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="py-10 text-center"
        >
            <motion.span
                aria-hidden="true"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-muted"
            >
                <Boxes className="size-5 text-muted-foreground" />
            </motion.span>
            <p className="text-sm text-muted-foreground">{children}</p>
        </motion.div>
    );
}

export default function Dashboard({ stats, statusBreakdown, branchBreakdown, recentActivity }) {
    const reduceMotion = useReducedMotion();
    const assignedPct = stats.totalHardware > 0
        ? Math.round((stats.assignedCount / stats.totalHardware) * 100)
        : 0;

    const captions = {
        assignedCount: `${assignedPct}% of hardware`,
    };

    const hasHardware = stats.totalHardware > 0;

    const doughnutData = {
        labels: statusBreakdown.map((row) => row.name),
        datasets: [{
            data: statusBreakdown.map((row) => row.total),
            backgroundColor: chartColors(statusBreakdown.length),
            borderColor: cssVar("--card") || "#fff",
            borderWidth: 2,
            hoverOffset: 8,
        }],
    };

    const barData = {
        labels: branchBreakdown.map((row) => row.name),
        datasets: [{
            label: "Hardware",
            data: branchBreakdown.map((row) => row.total),
            backgroundColor: cssVar("--chart-1") || "#7c9cc4",
            borderRadius: 6,
            maxBarThickness: 48,
        }],
    };

    const isDark = document.documentElement.classList.contains("dark");
    const tickColor = cssVar("--muted-foreground") || "#666";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    const chartTooltip = {
        backgroundColor: cssVar("--popover") || "#fff",
        titleColor: cssVar("--popover-foreground") || "#111",
        bodyColor: cssVar("--muted-foreground") || "#666",
        borderColor: cssVar("--border") || "#e5e5e5",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        displayColors: false,
    };

    // Arcs sweep in with a per-segment stagger; bars rise from the baseline.
    const chartAnimation = reduceMotion
        ? false
        : {
            duration: 900,
            easing: "easeOutQuart",
            delay: (ctx) => (ctx.type === "data" ? ctx.dataIndex * 70 : 0),
        };

    return (
        <Layout>
            <Head title="Dashboard" />
            <PageHeader
                icon={LayoutDashboard}
                title="Dashboard"
                description="Overview of hardware across all branches."
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {statCards.map((card, index) => (
                    <StatCard
                        key={card.key}
                        card={card}
                        index={index}
                        value={stats[card.key]}
                        caption={captions[card.key]}
                    />
                ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <motion.div
                    variants={fadeRise}
                    initial="hidden"
                    animate="show"
                    transition={{ ...spring, delay: 0.15 }}
                >
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Hardware by status</CardTitle>
                            <CardDescription>Distribution of active hardware across statuses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hasHardware ? (
                                <div className="mx-auto max-w-xs py-6">
                                    <Doughnut
                                        data={doughnutData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: true,
                                            animation: chartAnimation,
                                            plugins: {
                                                legend: {
                                                    position: "bottom",
                                                    labels: { color: tickColor, usePointStyle: true, padding: 14 },
                                                },
                                                tooltip: chartTooltip,
                                            },
                                        }}
                                        aria-label="Hardware by status chart"
                                        role="img"
                                    />
                                </div>
                            ) : (
                                <FloatingEmptyState>
                                    No hardware yet — charts will appear once devices are added.
                                </FloatingEmptyState>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    variants={fadeRise}
                    initial="hidden"
                    animate="show"
                    transition={{ ...spring, delay: 0.22 }}
                >
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Recent activity</CardTitle>
                            <CardDescription>Latest hardware updates across the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentActivity.length > 0 ? (
                                <ol
                                    className="max-h-80 space-y-3 overflow-y-auto pr-1"
                                    aria-label="Recent activity"
                                >
                                    {recentActivity.map((activity, index) => (
                                        <motion.li
                                            key={activity.id}
                                            variants={fadeRise}
                                            initial="hidden"
                                            animate="show"
                                            transition={{ ...spring, delay: 0.25 + index * 0.05 }}
                                            className="relative flex items-start gap-3"
                                        >
                                            {/* Connecting line between timeline dots */}
                                            {index < recentActivity.length - 1 && (
                                                <span
                                                    aria-hidden="true"
                                                    className="absolute top-4 left-[3px] h-[calc(100%+0.25rem)] w-px bg-border"
                                                />
                                            )}
                                            <span
                                                className="relative mt-1.5 size-2 shrink-0 rounded-full bg-primary/70"
                                                aria-hidden="true"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm">
                                                    <span className="font-medium">{activity.record_name}</span>
                                                    {activity.hardware_no && (
                                                        <span className="text-muted-foreground"> · {activity.hardware_no}</span>
                                                    )}
                                                </p>
                                                <p className="truncate text-sm text-muted-foreground">{activity.record_desc}</p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {activity.user_name ?? "Unknown"}
                                                    {" · "}
                                                    {new Date(activity.created_at).toLocaleString(undefined, {
                                                        dateStyle: "medium",
                                                        timeStyle: "short",
                                                    })}
                                                </p>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ol>
                            ) : (
                                <FloatingEmptyState>
                                    No activity yet — records appear as hardware changes.
                                </FloatingEmptyState>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div
                variants={fadeRise}
                initial="hidden"
                animate="show"
                transition={{ ...spring, delay: 0.29 }}
                className="mt-4"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Hardware by branch</CardTitle>
                        <CardDescription>Where devices are currently assigned.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {branchBreakdown.some((row) => row.total > 0) ? (
                            <div className="h-72">
                                <Bar
                                    data={barData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        animation: chartAnimation,
                                        plugins: { legend: { display: false }, tooltip: chartTooltip },
                                        scales: {
                                            x: {
                                                ticks: { color: tickColor, maxRotation: 40, minRotation: 0, autoSkip: false },
                                                grid: { display: false },
                                            },
                                            y: {
                                                beginAtZero: true,
                                                ticks: { color: tickColor, precision: 0 },
                                                grid: { color: gridColor },
                                            },
                                        },
                                    }}
                                    aria-label="Hardware by branch chart"
                                    role="img"
                                />
                            </div>
                        ) : (
                            <FloatingEmptyState>
                                No assignments yet — hardware appears here once users are assigned.
                            </FloatingEmptyState>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </Layout>
    );
}
