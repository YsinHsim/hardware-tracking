import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { fadeRise, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function PageHeader({ icon: Icon, title, description, actions, backHref, backLabel, className }) {
    return (
        <motion.header
            variants={fadeRise}
            initial="hidden"
            animate="show"
            className={cn(
                "relative mb-6 overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6",
                className
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
            />
            <motion.div
                aria-hidden="true"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/10 blur-3xl"
            />

            <div className="relative">
                {backHref && (
                    <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05, ...spring }}
                    >
                        <Link
                            href={backHref}
                            className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 py-1 pr-3 pl-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                        >
                            <ArrowLeft className="size-3.5" aria-hidden="true" />
                            {backLabel}
                        </Link>
                    </motion.div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        {Icon && (
                            <motion.span
                                initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                transition={{ ...spring, delay: 0.1 }}
                                className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25"
                            >
                                <Icon className="size-6" aria-hidden="true" />
                            </motion.span>
                        )}
                        <div className="min-w-0">
                            <motion.h1
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.16, ...spring }}
                                className="font-heading text-3xl font-semibold tracking-tight"
                            >
                                {title}
                            </motion.h1>
                            {description && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.24, ...spring }}
                                    className="mt-1 text-sm text-muted-foreground"
                                >
                                    {description}
                                </motion.p>
                            )}
                        </div>
                    </div>
                    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </div>
            </div>
        </motion.header>
    );
}
