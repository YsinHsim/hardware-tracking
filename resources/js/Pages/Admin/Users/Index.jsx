import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { UsersRound, Copy, Plus, Trash2, Eye } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Layout from "../../Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fadeRise, spring } from "@/lib/motion";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AdminUsersIndex({ users, roles }) {
    const { errors } = usePage().props;
    const [selection, setSelection] = useState({});
    const [inviteOpen, setInviteOpen] = useState(false);
    const [invite, setInvite] = useState({ email: "", role: "staff" });
    const invitationLink = usePage().props.flash?.invitationLink;
    const [deleteUser, setDeleteUser] = useState(null);

    function sendInvite(event) {
        event.preventDefault();
        router.post('/admin/invitations', invite, { onSuccess: () => { setInviteOpen(false); setInvite({ email: "", role: "staff" }); toast.success('Invitation created. Copy the link below.'); } });
    }

    const assign = (user) => {
        const role = selection[user.id] ?? user.role;
        if (!role) return;
        router.put(
            `/admin/users/${user.id}/role`,
            { role },
            {
                onSuccess: () => toast.success(`${user.name} is now ${role}.`),
                onError: () => toast.error("Could not change role."),
                preserveState: true,
            }
        );
    };

    function updateStatus(user) {
        const status = user.status === 'active' ? 'suspended' : 'active';
        router.put(`/admin/users/${user.id}/status`, { status }, {
            preserveState: true,
            onSuccess: () => toast.success(`${user.name} is now ${status}.`),
            onError: () => toast.error("Could not change account status."),
        });
    }

    function removeInvitation() {
        router.delete(`/admin/users/${deleteUser.id}`, {
            preserveState: true,
            onSuccess: () => { setDeleteUser(null); toast.success('Invited account deleted.'); },
            onError: () => toast.error("Could not delete invited account."),
        });
    }

    return (
        <Layout>
            <Head title="Users" />
            <PageHeader
                icon={UsersRound}
                title="Users"
                description="Login accounts, access roles, and invitations."
                actions={<Button onClick={() => setInviteOpen(true)}><Plus /> Invite user</Button>}
            />

            {invitationLink && <Card className="mb-4"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="font-medium">Invitation ready — valid for 48 hours</p><p className="truncate text-sm text-muted-foreground">{invitationLink}</p></div><Button variant="outline" onClick={() => { navigator.clipboard.writeText(invitationLink); toast.success('Invitation link copied.'); }}><Copy /> Copy link</Button></CardContent></Card>}
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}><DialogContent><DialogHeader><DialogTitle>Invite a user</DialogTitle></DialogHeader><form onSubmit={sendInvite} className="space-y-4"><div className="space-y-2"><Label>Email</Label><Input type="email" value={invite.email} onChange={(e) => setInvite({...invite,email:e.target.value})} required />{errors.email && <p className="text-sm text-destructive">{errors.email}</p>}</div><div className="space-y-2"><Label>Role</Label><Select name="role" value={invite.role} onValueChange={(role) => setInvite({...invite,role})}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent></Select></div><DialogFooter><Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button><Button>Create invitation</Button></DialogFooter></form></DialogContent></Dialog>

            {(errors.role || errors.status || errors.delete) && (
                <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errors.role || errors.status || errors.delete}
                </p>
            )}

            <motion.div variants={fadeRise} initial="hidden" animate="show" transition={spring}>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="w-48">Role</TableHead>
                                    <TableHead className="w-64 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell><Badge variant={user.status === 'active' ? 'default' : 'outline'}>{user.status}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={selection[user.id] ?? user.role ?? "none"}
                                                onValueChange={(value) =>
                                                    setSelection((prev) => ({ ...prev, [user.id]: value }))
                                                }
                                            >
                                                <SelectTrigger aria-label={`Role for ${user.name}`}>
                                                    <SelectValue placeholder="No role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {user.role === null && (
                                                        <SelectItem value="none" disabled>No role</SelectItem>
                                                    )}
                                                    {roles.map((role) => (
                                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/people/${user.id}`}>
                                                        <Eye className="size-4" aria-hidden="true" /> View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={(selection[user.id] ?? user.role) === user.role}
                                                    onClick={() => assign(user)}
                                                >
                                                    Save
                                                </Button>
                                                {user.status === 'invited' ? (
                                                    <Button size="sm" variant="destructive" onClick={() => setDeleteUser(user)}><Trash2 /> Delete</Button>
                                                ) : (
                                                    <Button size="sm" variant="outline" onClick={() => updateStatus(user)}>{user.status === 'active' ? 'Suspend' : 'Activate'}</Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
            <AlertDialog open={Boolean(deleteUser)} onOpenChange={(open) => !open && setDeleteUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete invited account?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently deletes {deleteUser?.email} and its invitation. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={removeInvitation}>Delete account</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
}
