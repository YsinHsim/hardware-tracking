import React from "react";
import { motion } from "motion/react";
import { fadeRise, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function PageHeader({ icon: Icon, title, description, actions, className }) {
    return (
        <motion.header
            variants={fadeRise}
            initial="hidden"
            animate="show"
            className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}
        >
            <div className="flex items-center gap-3.5">
                {Icon && (
                    <motion.span
                        initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ ...spring, delay: 0.08 }}
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-muted to-background text-foreground shadow-sm"
                    >
                        <Icon className="size-5" aria-hidden="true" />
                    </motion.span>
                )}
                <div className="min-w-0">
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </motion.header>
    );
}
