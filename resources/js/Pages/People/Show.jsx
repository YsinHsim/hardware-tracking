import React from "react";
import { Head, Link } from "@inertiajs/react";
import { Mail, MapPin, Monitor, ShieldCheck, UserRound, Eye } from "lucide-react";
import { motion } from "motion/react";
import Layout from "../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import HardwareStatusBadge from "@/components/HardwareStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fadeRise, listStagger, spring } from "@/lib/motion";

const MotionRow = motion.create(TableRow);

function statusBadge(status) {
    if (status === "active") return <Badge variant="default">Active</Badge>;
    if (status === "suspended") return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">Suspended</Badge>;
    return <Badge variant="outline">Invited</Badge>;
}

function verificationBadge(status) {
    const variants = {
        verified: "default",
        pending: "secondary",
        changes_requested: "outline",
        rejected: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
}

export default function PeopleShow({ person, hardware, isSelf }) {
    return (
        <Layout>
            <Head title={person.name} />
            <PageHeader
                icon={UserRound}
                title={person.name}
                description={isSelf ? "Your profile and assigned hardware." : "Profile and assigned hardware."}
                backHref={isSelf ? "/dashboard" : "/people"}
                backLabel={isSelf ? "Back to dashboard" : "Back to people"}
            />

            <Card className="mb-5">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Account, location, and role.</CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <dt className="flex items-center gap-1.5 text-sm text-muted-foreground"><UserRound className="size-3.5" /> Status</dt>
                            <dd className="mt-1">{statusBadge(person.status)}</dd>
                        </div>
                        <div>
                            <dt className="flex items-center gap-1.5 text-sm text-muted-foreground"><ShieldCheck className="size-3.5" /> Role</dt>
                            <dd className="mt-1 capitalize">{person.role || "—"}</dd>
                        </div>
                        <div>
                            <dt className="flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="size-3.5" /> Email</dt>
                            <dd className="mt-1 break-all">{person.email}</dd>
                        </div>
                        <div>
                            <dt className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-3.5" /> Branch</dt>
                            <dd className="mt-1">{person.branch?.name || "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Region</dt>
                            <dd className="mt-1">{person.branch?.region || "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Position</dt>
                            <dd className="mt-1">{person.position || "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-muted-foreground">Joined</dt>
                            <dd className="mt-1">{person.joined || "—"}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Monitor className="size-5" /> Assigned hardware
                        <Badge variant="secondary" className="ml-1 tabular-nums">{hardware.length}</Badge>
                    </CardTitle>
                    <CardDescription>Devices currently held by {person.name}.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-0">
                    {hardware.length === 0 ? (
                        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
                            No hardware assigned.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tag</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Condition</TableHead>
                                    <TableHead>Verification</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hardware.map((item, index) => (
                                    <MotionRow
                                        key={item.id}
                                        layout
                                        variants={fadeRise}
                                        initial="hidden"
                                        animate="show"
                                        transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                    >
                                        <TableCell>
                                            <Link href={`/hardwares/${item.id}`} className="font-mono font-medium hover:underline">
                                                {item.hardware_no}
                                            </Link>
                                            <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                {item.hardware_serial_no}
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.hardware_type?.hardware_type_name || "—"}</TableCell>
                                        <TableCell>
                                            <HardwareStatusBadge status={item.hardware_status?.hardware_status_name} />
                                        </TableCell>
                                        <TableCell>{verificationBadge(item.verification_status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/hardwares/${item.id}`}>
                                                    <Eye className="size-4" aria-hidden="true" /> Details
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </MotionRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </Layout>
    );
}
