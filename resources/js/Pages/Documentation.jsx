import React from "react";
import { Link } from "@inertiajs/react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Layout from "./Layouts/Layout";
import { Separator } from "@/components/ui/separator";
import { fadeRise, spring } from "@/lib/motion";

const sections = [
    { id: "introduction", label: "Introduction" },
    { id: "branches", label: "Branches" },
    { id: "assigned-users", label: "Assigned Users" },
    { id: "hardwares", label: "Hardware" },
];

function Step({ children }) {
    return <li className="text-sm text-muted-foreground">{children}</li>;
}

function InlineLink({ href, children }) {
    return (
        <Link href={href} className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
            {children}
        </Link>
    );
}

export default function Documentation() {
    const currentYear = new Date().getFullYear();

    return (
        <Layout>
            <motion.div
                variants={fadeRise}
                initial="hidden"
                animate="show"
                transition={spring}
                className="mx-auto max-w-4xl"
            >
                <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                    <div className="min-w-0 flex-1">
                        <h1 className="font-heading text-3xl font-semibold">Documentation</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            How to set up branches, users and hardware in the tracking app.
                        </p>

                        <section id="introduction" className="mt-8 scroll-mt-6">
                            <h2 className="font-heading text-xl font-semibold">Introduction</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                The <span className="font-medium text-foreground">Hardware Tracking Application</span> is a
                                web-based tool designed to help you manage and track hardware assets (e.g., devices,
                                tools, equipment) across multiple locations. With this application, you can easily add,
                                update, and delete assets, as well as search and filter them based on specific criteria.
                            </p>
                        </section>

                        <Separator className="my-6" />

                        <section id="branches" className="scroll-mt-6">
                            <h2 className="font-heading text-xl font-semibold">Branches</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Branches represent locations or groups where hardware is stored or used. Before you can
                                add hardware or assign users, you need to create a branch.
                            </p>
                            <p className="mt-4 text-sm font-medium">How to create an branch:</p>
                            <ol className="mt-2 list-decimal space-y-1 pl-5">
                                <Step>Go to the <InlineLink href="/branches">Branches</InlineLink> page.</Step>
                                <Step>Click the <span className="font-medium text-foreground">Create branch</span> button.</Step>
                                <Step>You may create a <span className="font-medium text-foreground">Region</span> first if it does not exist, then proceed to create the <span className="font-medium text-foreground">Branch</span>.</Step>
                                <Step>For the <span className="font-medium text-foreground">Branch</span>, fill in the <span className="font-medium text-foreground">Branch name</span> and <span className="font-medium text-foreground">Region</span> fields.</Step>
                                <Step>Click <span className="font-medium text-foreground">Create</span> to save the branch.</Step>
                            </ol>
                        </section>

                        <Separator className="my-6" />

                        <section id="assigned-users" className="scroll-mt-6">
                            <h2 className="font-heading text-xl font-semibold">Assigned Users</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Assigned users are individuals responsible for hardware assets. Each user must be
                                linked to a branch.
                            </p>
                            <p className="mt-4 text-sm font-medium">How to create an assigned user:</p>
                            <ol className="mt-2 list-decimal space-y-1 pl-5">
                                <Step>Go to the <InlineLink href="/users">Assigned Users</InlineLink> page.</Step>
                                <Step>Click the <span className="font-medium text-foreground">Add user</span> button.</Step>
                                <Step>Fill out the form with the user details (e.g., name, email).</Step>
                                <Step>Select the branch the user belongs to.</Step>
                                <Step>Click <span className="font-medium text-foreground">Save</span> to create the user.</Step>
                            </ol>
                        </section>

                        <Separator className="my-6" />

                        <section id="hardwares" className="scroll-mt-6">
                            <h2 className="font-heading text-xl font-semibold">Hardware</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Hardware represents the physical assets you want to track. Each hardware item must be
                                assigned to a user.
                            </p>
                            <p className="mt-4 text-sm font-medium">How to add hardware:</p>
                            <ol className="mt-2 list-decimal space-y-1 pl-5">
                                <Step>Go to the <InlineLink href="/hardwares">Hardware</InlineLink> page.</Step>
                                <Step>Click the <span className="font-medium text-foreground">Add hardware</span> button.</Step>
                                <Step>
                                    Fill out the form with the hardware details:
                                    <ul className="mt-1 list-disc space-y-1 pl-5">
                                        <li>Hardware No</li>
                                        <li>Serial No</li>
                                        <li>Branch</li>
                                        <li>Hardware type</li>
                                        <li>Hardware status</li>
                                    </ul>
                                </Step>
                                <Step>Select the assigned user for the hardware.</Step>
                                <Step>Click <span className="font-medium text-foreground">Create</span> to add the hardware.</Step>
                            </ol>
                        </section>

                        <Separator className="my-6" />

                        <footer className="pb-2 text-sm text-muted-foreground">
                            <p>© {currentYear} Hardware Tracking Application. All rights reserved.</p>
                            <p className="mt-1 text-xs">
                                Built with Laravel, Inertia, React, shadcn/ui and Tailwind CSS.
                            </p>
                            <Link
                                href="/about"
                                className="mt-2 inline-flex items-center gap-1 font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                            >
                                About us <ArrowRight className="size-3.5" />
                            </Link>
                        </footer>
                    </div>

                    <aside className="shrink-0 lg:w-52">
                        <nav
                            aria-label="On this page"
                            className="rounded-xl border border-border bg-card p-4 lg:sticky lg:top-6"
                        >
                            <p className="text-sm font-semibold">On this page</p>
                            <ul className="mt-3 space-y-2 text-sm">
                                {sections.map((section) => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            className="text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {section.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>
                </div>
            </motion.div>
        </Layout>
    );
}
