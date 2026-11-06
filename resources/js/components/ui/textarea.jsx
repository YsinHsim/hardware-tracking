import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }) {
    return <textarea data-slot="textarea" className={cn("flex min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50", className)} {...props} />;
}

export { Textarea };
