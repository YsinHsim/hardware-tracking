import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Eye, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../Layouts/Layout";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fadeRise, listStagger, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MotionRow = motion.create(TableRow);

function UserActions({ user, onDelete }) {
    return (
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-sm" asChild aria-label={`View ${user.user_name}`}>
                        <Link href={`/users/${user.id}`}><Eye /></Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(user)}
                        aria-label={`Delete ${user.user_name}`}
                    >
                        <Trash2 />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}

export default function Index({ users }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [deleting, setDeleting] = useState(false);

    function confirmDelete(event) {
        event.preventDefault();
        if (!selectedUser) return;
        setDeleting(true);
        router.delete(`/users/${selectedUser.id}`, {
            onSuccess: () => {
                toast.success("User deleted successfully!");
                setSelectedUser(null);
                setDeleteError("");
            },
            onError: (errors) => setDeleteError(errors.delete ?? "Failed to delete user. Please try again."),
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <Layout>
            <TooltipProvider>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-heading text-3xl font-semibold">Users</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Manage assigned hardware users.</p>
                    </div>
                    <Button asChild><Link href="/users/create"><Plus /> Add user</Link></Button>
                </div>

                {users.data.length > 0 ? (
                    <>
                        <div className="hidden rounded-xl border border-border bg-card md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Estate</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence initial={false}>
                                        {users.data.map((user, index) => (
                                            <MotionRow
                                                key={user.id}
                                                layout
                                                variants={fadeRise}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                            >
                                                <TableCell><Link href={`/users/${user.id}`} className="font-medium hover:underline">{user.user_name}</Link></TableCell>
                                                <TableCell>{user.user_position?.position_name || "N/A"}</TableCell>
                                                <TableCell>{user.estate?.estate_name || "N/A"}</TableCell>
                                                <TableCell><UserActions user={user} onDelete={setSelectedUser} /></TableCell>
                                            </MotionRow>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="space-y-3 md:hidden">
                            <AnimatePresence initial={false}>
                                {users.data.map((user, index) => (
                                    <motion.div
                                        key={user.id}
                                        layout
                                        variants={fadeRise}
                                        initial="hidden"
                                        animate="show"
                                        exit="hidden"
                                        transition={{ ...spring, delay: index * listStagger.staggerChildren }}
                                    >
                                        <Card size="sm">
                                            <CardContent className="space-y-3">
                                                <div>
                                                    <Link href={`/users/${user.id}`} className="font-medium hover:underline">{user.user_name}</Link>
                                                    <p className="mt-1 text-sm text-muted-foreground">{user.user_position?.position_name || "N/A"}</p>
                                                    <p className="text-sm text-muted-foreground">{user.estate?.estate_name || "N/A"}</p>
                                                </div>
                                                <UserActions user={user} onDelete={setSelectedUser} />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <nav className="mt-5 flex flex-wrap justify-end gap-1" aria-label="Pagination">
                            {users.links?.map((link, index) => (
                                link.url ? (
                                    <Button key={index} variant={link.active ? "default" : "outline"} size="sm" asChild>
                                        <Link href={link.url} preserveScroll preserveState dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ) : (
                                    <span
                                        key={index}
                                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none opacity-50")}
                                        aria-disabled="true"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </nav>
                    </>
                ) : (
                    <Card className="items-center py-10 text-center">
                        <CardContent>
                            <p className="font-heading text-lg">No user data exists.</p>
                            <Button className="mt-4" asChild><Link href="/users/create">Add user</Link></Button>
                        </CardContent>
                    </Card>
                )}
            </TooltipProvider>

            <AlertDialog
                open={Boolean(selectedUser)}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setSelectedUser(null);
                        setDeleteError("");
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedUser?.user_name}?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the assigned user.</AlertDialogDescription>
                    </AlertDialogHeader>
                    {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleting}>
                            {deleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
}
