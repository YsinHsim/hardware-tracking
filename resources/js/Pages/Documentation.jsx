import React, { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    BookOpen,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    History,
    Mail,
    Monitor,
    Settings2,
    ShieldCheck,
    UserRound,
    UsersRound,
} from "lucide-react";
import { motion } from "motion/react";
import Layout from "./Layouts/Layout";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fadeRise, listStagger, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

const sections = [
    { id: "getting-started", label: "Getting started", icon: BookOpen },
    { id: "roles", label: "Roles & permissions", icon: ShieldCheck },
    { id: "onboarding", label: "Onboarding users", icon: Mail },
    { id: "branches", label: "Branches & system data", icon: Building2 },
    { id: "submitting", label: "Submitting hardware", icon: Monitor },
    { id: "reviewing", label: "Reviewing submissions", icon: ClipboardCheck },
    { id: "people", label: "Looking up people", icon: UsersRound },
    { id: "history", label: "History & deleted hardware", icon: History },
    { id: "faq", label: "FAQ", icon: CheckCircle2 },
];

function Section({ id, icon: Icon, title, children, index }) {
    return (
        <motion.section
            id={id}
            variants={fadeRise}
            initial="hidden"
            animate="show"
            transition={{ ...spring, delay: index * listStagger.staggerChildren }}
            className="scroll-mt-6"
        >
            <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                </span>
                <h2 className="font-heading text-xl font-semibold">{title}</h2>
            </div>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {children}
            </div>
        </motion.section>
    );
}

function Step({ number, children }) {
    return (
        <li className="flex gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
                {number}
            </span>
            <span className="flex-1">{children}</span>
        </li>
    );
}

function InlineLink({ href, children }) {
    return (
        <Link
            href={href}
            className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
            {children}
        </Link>
    );
}

function Callout({ tone = "info", children }) {
    const tones = {
        info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
        warn: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    };
    return (
        <div className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone])}>
            {children}
        </div>
    );
}

function RoleCard({ name, scope, children }) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="capitalize text-base">{name}</CardTitle>
                    <Badge variant="secondary">{scope}</Badge>
                </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{children}</CardContent>
        </Card>
    );
}

export default function Documentation() {
    const currentYear = new Date().getFullYear();
    const [active, setActive] = useState(sections[0].id);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
        );
        sections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    return (
        <Layout>
            <div className="mx-auto max-w-6xl">
                <PageHeader
                    icon={BookOpen}
                    title="Documentation"
                    description="How AssetHub works — accounts, hardware, verification, and history."
                />

                <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
                    <div className="min-w-0 flex-1 space-y-10">
                        <Section id="getting-started" icon={BookOpen} title="Getting started" index={0}>
                            <p>
                                <span className="font-medium text-foreground">AssetHub</span> tracks IT hardware
                                across branches. Every device is assigned to a real login account, goes through
                                a verification step before it becomes official, and keeps a full audit history.
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Card>
                                    <CardContent className="pt-5">
                                        <p className="font-medium text-foreground">Accounts own hardware</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            No separate "assigned users" list — assignments point at real login
                                            accounts with a branch and position.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-5">
                                        <p className="font-medium text-foreground">Invitation-only sign-up</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            A superadmin invites an email. The recipient sets their own password
                                            and completes their profile before they can log in.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-5">
                                        <p className="font-medium text-foreground">Verified, not just added</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Hardware submitted by users is reviewed by a manager in their branch
                                            before it counts as confirmed.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-5">
                                        <p className="font-medium text-foreground">Full history</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Every change and every review is recorded and visible on the
                                            hardware detail page.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </Section>

                        <Separator />

                        <Section id="roles" icon={ShieldCheck} title="Roles & permissions" index={1}>
                            <p>
                                Access is controlled by Spatie permissions, grouped by module
                                (<code className="rounded bg-muted px-1 font-mono text-xs">hardware</code>,{" "}
                                <code className="rounded bg-muted px-1 font-mono text-xs">users</code>,{" "}
                                <code className="rounded bg-muted px-1 font-mono text-xs">branches</code>,{" "}
                                <code className="rounded bg-muted px-1 font-mono text-xs">system-data</code>)
                                and action (<code className="rounded bg-muted px-1 font-mono text-xs">view</code>,{" "}
                                <code className="rounded bg-muted px-1 font-mono text-xs">create</code>,{" "}
                                <code className="rounded bg-muted px-1 font-mono text-xs">edit</code>,{" "}
                                <code className="rounded bg-muted px-1 font-mono text-xs">delete</code>).
                            </p>
                            <div className="grid gap-3 md:grid-cols-3">
                                <RoleCard name="superadmin" scope="All branches">
                                    Full access including role/user management, invitations, and deleted hardware.
                                    The superadmin bypasses permission checks via a gate rule.
                                </RoleCard>
                                <RoleCard name="manager" scope="Own branch">
                                    All operational permissions. Reviews hardware in their own branch, sees
                                    only their branch in the People directory.
                                </RoleCard>
                                <RoleCard name="staff" scope="Own branch">
                                    Read-only on every module. Submits their own hardware via{" "}
                                    <span className="font-medium text-foreground">My Hardware</span>.
                                </RoleCard>
                            </div>
                            <p>
                                Custom roles can be created from{" "}
                                <InlineLink href="/admin/roles">Admin → Roles & Access</InlineLink>. Permission
                                changes take effect immediately and affect both the sidebar and direct URL access.
                            </p>
                            <Callout tone="warn">
                                Hardware list and edit routes are not yet branch-scoped — a manager with{" "}
                                <code className="font-mono text-xs">hardware.edit</code> can edit hardware in
                                another branch. See <code className="font-mono text-xs">docs/BRANCH_SCOPE.md</code>{" "}
                                for the plan.
                            </Callout>
                        </Section>

                        <Separator />

                        <Section id="onboarding" icon={Mail} title="Onboarding users" index={2}>
                            <p>
                                AssetHub does not have self-signup. A superadmin invites an email address; the
                                recipient sets their own password and profile before they can log in.
                            </p>
                            <ol className="space-y-3">
                                <Step number={1}>
                                    Superadmin opens{" "}
                                    <InlineLink href="/admin/users">Admin → Users</InlineLink> and clicks{" "}
                                    <span className="font-medium text-foreground">Invite user</span>.
                                </Step>
                                <Step number={2}>
                                    Enter the recipient's email and pick a role (staff, manager, or a custom role).
                                </Step>
                                <Step number={3}>
                                    Copy the 48-hour link and send it to the recipient. The link is single-use
                                    once onboarding completes, but can be retried if they close the browser
                                    mid-flow.
                                </Step>
                                <Step number={4}>
                                    Recipient opens the link, confirms the email matches, sets a password,
                                    picks their branch and position.
                                </Step>
                                <Step number={5}>
                                    Account becomes <Badge variant="default">Active</Badge> and they can log in.
                                </Step>
                            </ol>
                            <Callout>
                                Invited accounts that never completed onboarding can be deleted from{" "}
                                <span className="font-medium">Admin → Users</span>. Active accounts should be
                                suspended instead — deletion is blocked to preserve history.
                            </Callout>
                        </Section>

                        <Separator />

                        <Section id="branches" icon={Building2} title="Branches & system data" index={3}>
                            <p>
                                Branches are the locations hardware is assigned to. Each branch belongs to a
                                region. Lookup tables (hardware types, statuses, positions, regions) live in{" "}
                                <InlineLink href="/system-data">System Data</InlineLink>.
                            </p>
                            <ol className="space-y-3">
                                <Step number={1}>
                                    Open <InlineLink href="/branches">Branches</InlineLink> and click{" "}
                                    <span className="font-medium text-foreground">Create branch</span>.
                                </Step>
                                <Step number={2}>
                                    Pick an existing region, or create a new one inline.
                                </Step>
                                <Step number={3}>
                                    Name the branch and save. Users and hardware can now be assigned to it.
                                </Step>
                            </ol>
                            <Callout>
                                Lookups are seeded from{" "}
                                <code className="font-mono text-xs">database/seeders/LookupSeeder.php</code>.
                                You can add more via System Data without redeploying.
                            </Callout>
                        </Section>

                        <Separator />

                        <Section id="submitting" icon={Monitor} title="Submitting hardware" index={4}>
                            <p>
                                Users submit their own hardware from{" "}
                                <InlineLink href="/my-hardware">My Hardware</InlineLink>. Each submission starts
                                as <Badge variant="secondary">pending</Badge> and is reviewed by a manager in
                                the same branch.
                            </p>
                            <ol className="space-y-3">
                                <Step number={1}>
                                    Open <InlineLink href="/my-hardware">My Hardware</InlineLink> and click{" "}
                                    <span className="font-medium text-foreground">Submit hardware</span>.
                                </Step>
                                <Step number={2}>
                                    Fill in hardware number, serial number, type, and condition. Submit.
                                </Step>
                                <Step number={3}>
                                    Managers in your branch and superadmins are notified. The hardware shows as{" "}
                                    <Badge variant="secondary">pending</Badge>.
                                </Step>
                                <Step number={4}>
                                    Once reviewed, the status becomes{" "}
                                    <Badge variant="default">verified</Badge>,{" "}
                                    <Badge variant="outline">changes requested</Badge>, or{" "}
                                    <Badge variant="destructive">rejected</Badge>.
                                </Step>
                                <Step number={5}>
                                    If <span className="font-medium text-foreground">changes requested</span>,
                                    edit the hardware and resubmit. Other states cannot be edited.
                                </Step>
                            </ol>
                        </Section>

                        <Separator />

                        <Section id="reviewing" icon={ClipboardCheck} title="Reviewing submissions" index={5}>
                            <p>
                                The <InlineLink href="/verification">Verification</InlineLink> queue lists
                                every <Badge variant="secondary">pending</Badge> submission in your branch
                                (or all branches for superadmins).
                            </p>
                            <ol className="space-y-3">
                                <Step number={1}>
                                    Open <InlineLink href="/verification">Verification</InlineLink>. The
                                    table shows tag, assigned user, type, condition, submitter, and age.
                                </Step>
                                <Step number={2}>
                                    Click <span className="font-medium text-foreground">Review</span> on a row.
                                </Step>
                                <Step number={3}>
                                    Pick an action:
                                    <ul className="mt-2 list-disc space-y-1 pl-5">
                                        <li>
                                            <span className="font-medium text-foreground">Verify assignment</span> —
                                            one click, no notes needed.
                                        </li>
                                        <li>
                                            <span className="font-medium text-foreground">Request changes</span> —
                                            requires notes telling the submitter what to fix.
                                        </li>
                                        <li>
                                            <span className="font-medium text-foreground">Reject</span> — requires
                                            notes explaining why.
                                        </li>
                                    </ul>
                                </Step>
                            </ol>
                            <Callout tone="warn">
                                You cannot review hardware you submitted yourself — another reviewer in the
                                same branch must action it.
                            </Callout>
                        </Section>

                        <Separator />

                        <Section id="people" icon={UsersRound} title="Looking up people" index={6}>
                            <p>
                                The <InlineLink href="/people">People</InlineLink> directory is a read-only
                                view of every account and the hardware they hold. It's separate from the
                                superadmin's <span className="font-medium text-foreground">Admin → Users</span>{" "}
                                console.
                            </p>
                            <ol className="space-y-3">
                                <Step number={1}>
                                    Open <InlineLink href="/people">People</InlineLink>. Managers see only
                                    their own branch; superadmins see everyone.
                                </Step>
                                <Step number={2}>
                                    Search by name or email. The table shows status, role, branch, position,
                                    and how many devices they hold.
                                </Step>
                                <Step number={3}>
                                    Click a row to open the profile. You'll see their branch, region, position,
                                    role, status, joined date, and a table of assigned hardware.
                                </Step>
                                <Step number={4}>
                                    Click any hardware row to see its full detail page, including update history
                                    and verification reviews.
                                </Step>
                            </ol>
                            <Callout tone="success">
                                Anyone can open their own profile — no permission needed. Useful for checking
                                what hardware is registered against your account.
                            </Callout>
                        </Section>

                        <Separator />

                        <Section id="history" icon={History} title="History & deleted hardware" index={7}>
                            <p>
                                Every hardware row keeps two audit trails, both visible on its detail page:
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Card>
                                    <CardContent className="pt-5">
                                        <p className="font-medium text-foreground">Update records</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Created, edited, deleted, restored — with field-level change
                                            descriptions and who made them.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-5">
                                        <p className="font-medium text-foreground">Verification reviews</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Each review's status, reviewer, and notes. Useful for seeing why a
                                            device was rejected or sent back.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                            <p>
                                Deleting hardware is a soft delete — the row moves to{" "}
                                <InlineLink href="/admin/deleted-hardware">Admin → Deleted hardware</InlineLink>{" "}
                                (superadmin only). Its history is preserved and it can be restored.
                            </p>
                        </Section>

                        <Separator />

                        <Section id="faq" icon={CheckCircle2} title="FAQ" index={8}>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-foreground">I forgot my password.</p>
                                    <p className="mt-1">
                                        Use{" "}
                                        <InlineLink href="/settings/password">Settings → Password</InlineLink>{" "}
                                        if you're logged in. Otherwise contact a superadmin to reset.
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="font-medium text-foreground">Suspend vs delete?</p>
                                    <p className="mt-1">
                                        Suspend an active account to revoke access without losing history.
                                        Delete is only available for invited accounts that never finished
                                        onboarding.
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="font-medium text-foreground">Who can verify my hardware?</p>
                                    <p className="mt-1">
                                        Any manager in your branch with the{" "}
                                        <code className="rounded bg-muted px-1 font-mono text-xs">hardware.verify</code>{" "}
                                        permission, or any superadmin. You cannot verify your own submission.
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="font-medium text-foreground">Why can't I see the People link?</p>
                                    <p className="mt-1">
                                        It requires the{" "}
                                        <code className="rounded bg-muted px-1 font-mono text-xs">users.view</code>{" "}
                                        permission. Staff and manager roles include it by default; custom roles
                                        may not. You can still open your own profile via the user menu.
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="font-medium text-foreground">Can I edit hardware someone else submitted?</p>
                                    <p className="mt-1">
                                        Only if you have{" "}
                                        <code className="rounded bg-muted px-1 font-mono text-xs">hardware.edit</code>{" "}
                                        permission. Submitters themselves can only edit when the hardware is in{" "}
                                        <Badge variant="outline">changes requested</Badge> state.
                                    </p>
                                </div>
                            </div>
                        </Section>

                        <footer className="pb-2 text-sm text-muted-foreground">
                            <p>© {currentYear} AssetHub. All rights reserved.</p>
                            <Link
                                href="/about"
                                className="mt-2 inline-flex items-center gap-1 font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                            >
                                About us <ArrowRight className="size-3.5" />
                            </Link>
                        </footer>
                    </div>

                    <aside className="shrink-0 lg:w-60">
                        <nav
                            aria-label="On this page"
                            className="rounded-xl border border-border bg-card p-4 lg:sticky lg:top-6"
                        >
                            <p className="text-sm font-semibold">On this page</p>
                            <ul className="mt-3 space-y-1 text-sm">
                                {sections.map(({ id, label, icon: Icon }) => (
                                    <li key={id}>
                                        <a
                                            href={`#${id}`}
                                            className={cn(
                                                "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
                                                active === id
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>
                </div>
            </div>
        </Layout>
    );
}
