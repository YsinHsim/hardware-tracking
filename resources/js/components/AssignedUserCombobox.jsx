import React, { useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function AssignedUserCombobox({ value, branches, assignedUsers, onChange, invalid = false, disabled = false, placeholder = "Select assigned user" }) {
    const id = useId();
    const searchRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const users = useMemo(
        () => branches.flatMap((branch) => (assignedUsers[branch.id] ?? []).map((user) => ({
            ...user,
            branch_name: branch.branch_name,
        }))),
        [branches, assignedUsers]
    );
    const selected = users.find((user) => String(user.id) === String(value));
    const query = search.trim().toLowerCase();
    const filtered = query
        ? users.filter((user) => [user.name, user.position?.position_name, user.branch_name]
            .some((text) => text?.toLowerCase().includes(query)))
        : users;
    const groups = branches
        .map((branch) => ({
            ...branch,
            users: filtered.filter((user) => String(user.branch_id) === String(branch.id)),
        }))
        .filter((branch) => branch.users.length > 0);

    function select(userId) {
        onChange(userId);
        setOpen(false);
        setSearch("");
        setActiveIndex(-1);
    }

    function handleKeyDown(event) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === "Enter" && activeIndex >= 0 && filtered[activeIndex]) {
            event.preventDefault();
            select(String(filtered[activeIndex].id));
        } else if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
        }
    }

    return (
        <div className="flex gap-2">
            <Popover open={open} onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen) {
                    setSearch("");
                    setActiveIndex(-1);
                }
            }}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={`${id}-listbox`}
                        aria-invalid={invalid}
                        disabled={disabled}
                        className="h-10 min-w-0 flex-1 justify-between px-3 font-normal"
                    >
                        <span className="flex min-w-0 items-center gap-2 text-left">
                            <UserRound className="shrink-0 text-muted-foreground" />
                            {selected ? (
                                <span className="min-w-0">
                                    <span className="block truncate">{selected.name}</span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                        {[selected.position?.position_name, selected.branch_name].filter(Boolean).join(" · ")}
                                    </span>
                                </span>
                            ) : (
                                <span className="text-muted-foreground">{placeholder}</span>
                            )}
                        </span>
                        <ChevronsUpDown className="shrink-0 text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                    <div className="relative border-b border-border p-2">
                        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            ref={searchRef}
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setActiveIndex(-1);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Search name, position, or branch…"
                            aria-label="Search assigned users"
                            aria-activedescendant={activeIndex >= 0 ? `${id}-option-${filtered[activeIndex]?.id}` : undefined}
                            className="border-0 pl-8 shadow-none focus-visible:ring-0"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-72 overflow-y-auto p-1">
                        <button
                            type="button"
                            onClick={() => select("")}
                            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                        >
                            <span>Unassigned</span>
                            {!selected && <Check className="size-4" />}
                        </button>
                        {groups.map((branch) => (
                            <div key={branch.id} role="group" aria-label={branch.branch_name}>
                                <p className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">{branch.branch_name}</p>
                                {branch.users.map((user) => {
                                    const index = filtered.findIndex((item) => item.id === user.id);
                                    return (
                                        <button
                                            key={user.id}
                                            id={`${id}-option-${user.id}`}
                                            type="button"
                                            role="option"
                                            aria-selected={String(value) === String(user.id)}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            onClick={() => select(String(user.id))}
                                            className={cn(
                                                "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm",
                                                activeIndex === index ? "bg-accent" : "hover:bg-accent"
                                            )}
                                        >
                                            <span className="min-w-0">
                                                <span className="block truncate">{user.name}</span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {user.position?.position_name || "No position"}
                                                </span>
                                            </span>
                                            {String(value) === String(user.id) && <Check className="size-4 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <p className="px-2 py-6 text-center text-sm text-muted-foreground">No users found.</p>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
            {selected && (
                <Button type="button" variant="ghost" size="icon" className="size-10" onClick={() => select("")} aria-label="Unassign user" title="Unassign user">
                    <X />
                </Button>
            )}
        </div>
    );
}
