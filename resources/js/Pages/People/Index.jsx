import React, { useEffect, useRef, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Eye, Search, UsersRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Layout from "../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function PeopleIndex({ people, filters, canViewAllBranches }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const searchDebounce = useRef(null);
    const firstRun = useRef(true);

    useEffect(() => setSearch(filters.search ?? ""), [filters.search]);

    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => {
            router.get("/people", { search }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(searchDebounce.current);
    }, [search]);

    return (
        <Layout>
            <Head title="People" />
            <PageHeader
                icon={UsersRound}
                title="People"
                description={canViewAllBranches
                    ? "Accounts across all branches and their assigned hardware."
                    : "People in your branch and their assigned hardware."}
            />

            <Card className="mb-4">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email…"
                            className="pl-9"
                            aria-label="Search people"
                        />
                    </div>
                </CardContent>
            </Card>

            {people.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        No people found.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="hidden rounded-xl border border-border bg-card md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead className="text-right">Hardware</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence initial={false}>
                                    {people.map((person, index) => (
                                        <MotionRow
                                            key={person.id}
                                            layout
                                            variants={fadeRise}
                                            initial="hidden"
                                            animate="show"
                                            exit="hidden"
                                            transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                        >
                                            <TableCell>
                                                <Link href={`/people/${person.id}`} className="font-medium hover:underline">
                                                    {person.name}
                                                </Link>
                                                <div className="mt-0.5 text-xs text-muted-foreground">{person.email}</div>
                                            </TableCell>
                                            <TableCell>{statusBadge(person.status)}</TableCell>
                                            <TableCell className="capitalize">{person.role || "—"}</TableCell>
                                            <TableCell>
                                                {person.branch ? (
                                                    <>
                                                        <div>{person.branch.name}</div>
                                                        <div className="text-xs text-muted-foreground">{person.branch.region}</div>
                                                    </>
                                                ) : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell>{person.position || <span className="text-muted-foreground">—</span>}</TableCell>
                                            <TableCell className="text-right tabular-nums">{person.hardware_count}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/people/${person.id}`}>
                                                        <Eye className="size-4" aria-hidden="true" /> View
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </MotionRow>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-3 md:hidden">
                        {people.map((person, index) => (
                            <motion.div
                                key={person.id}
                                variants={fadeRise}
                                initial="hidden"
                                animate="show"
                                transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                            >
                                <Card>
                                    <CardContent className="space-y-3 pt-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <Link href={`/people/${person.id}`} className="font-medium hover:underline">
                                                    {person.name}
                                                </Link>
                                                <div className="truncate text-xs text-muted-foreground">{person.email}</div>
                                            </div>
                                            {statusBadge(person.status)}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                                                <p className="mt-0.5 capitalize">{person.role || "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Hardware</p>
                                                <p className="mt-0.5 tabular-nums">{person.hardware_count}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Branch</p>
                                                <p className="mt-0.5">{person.branch?.name || "—"}{person.branch?.region ? ` · ${person.branch.region}` : ""}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Position</p>
                                                <p className="mt-0.5">{person.position || "—"}</p>
                                            </div>
                                        </div>
                                        <Button className="w-full" variant="outline" asChild>
                                            <Link href={`/people/${person.id}`}>
                                                <Eye className="size-4" aria-hidden="true" /> View profile
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}
        </Layout>
    );
}
