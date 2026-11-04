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
import { motion } from "motion/react";
import Layout from "./Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeRise, listStagger, spring } from "@/lib/motion";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function chartColors(count) {
    const tokens = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];
    return Array.from({ length: count }, (_, i) => cssVar(tokens[i % tokens.length]) || "#7c9cc4");
}

const statCards = [
    { key: "totalHardware", label: "Total hardware", icon: Boxes, description: "Active devices on record" },
    { key: "assignedRate", label: "Assigned", icon: Link2, description: "Share of hardware in use" },
    { key: "unassignedCount", label: "Unassigned", icon: Unlink, description: "Devices without a user" },
    { key: "faultyCount", label: "Faulty", icon: AlertTriangle, description: "Devices marked faulty" },
    { key: "totalBranches", label: "Branches", icon: Building2, description: "Branches on record" },
];

export default function Dashboard({ stats, statusBreakdown, branchBreakdown, recentActivity }) {
    const assignedPct = stats.totalHardware > 0
        ? Math.round((stats.assignedCount / stats.totalHardware) * 100)
        : 0;

    const values = {
        totalHardware: stats.totalHardware,
        assignedRate: `${stats.assignedCount} (${assignedPct}%)`,
        unassignedCount: stats.unassignedCount,
        faultyCount: stats.faultyCount,
        totalBranches: stats.totalBranches,
    };

    const hasHardware = stats.totalHardware > 0;

    const doughnutData = {
        labels: statusBreakdown.map((row) => row.name),
        datasets: [{
            data: statusBreakdown.map((row) => row.total),
            backgroundColor: chartColors(statusBreakdown.length),
            borderColor: cssVar("--card") || "#fff",
            borderWidth: 2,
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

    return (
        <Layout>
            <Head title="Dashboard" />
            <PageHeader
                icon={LayoutDashboard}
                title="Dashboard"
                description="Overview of hardware across all branches."
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.key}
                            variants={fadeRise}
                            initial="hidden"
                            animate="show"
                            transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                        >
                            <Card size="sm" className="h-full">
                                <CardContent className="flex items-center gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <Icon className="size-5" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm text-muted-foreground">{card.label}</p>
                                        <p className="font-heading text-2xl font-semibold">{values[card.key]}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
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
                                <div className="mx-auto max-w-xs">
                                    <Doughnut
                                        data={doughnutData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: true,
                                            plugins: {
                                                legend: {
                                                    position: "bottom",
                                                    labels: { color: tickColor, usePointStyle: true, padding: 14 },
                                                },
                                            },
                                        }}
                                        aria-label="Hardware by status chart"
                                        role="img"
                                    />
                                </div>
                            ) : (
                                <p className="py-10 text-center text-sm text-muted-foreground">
                                    No hardware yet — charts will appear once devices are added.
                                </p>
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
                                <ol className="space-y-3" aria-label="Recent activity">
                                    {recentActivity.map((activity) => (
                                        <li key={activity.id} className="flex items-start gap-3">
                                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
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
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className="py-10 text-center text-sm text-muted-foreground">
                                    No activity yet — records appear as hardware changes.
                                </p>
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
                                        plugins: { legend: { display: false } },
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
                            <p className="py-10 text-center text-sm text-muted-foreground">
                                No assignments yet — hardware appears here once users are assigned.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </Layout>
    );
}
