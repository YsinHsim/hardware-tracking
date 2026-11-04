import React from "react";
import {
    ArrowRight,
    Code2,
    Database,
    ExternalLink,
    GitFork,
    Mail,
    MessageCircle,
    MonitorSmartphone,
    Palette,
} from "lucide-react";
import { motion } from "motion/react";
import Layout from "./Layouts/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fadeRise, spring } from "@/lib/motion";

const technologies = [
    {
        icon: Code2,
        title: "Backend",
        name: "Laravel & Inertia.js",
        description:
            "A powerful combination for building modern web applications. Laravel handles the backend with robust features like authentication and database management, while Inertia.js bridges the gap between Laravel and React, allowing seamless, single-page app development without the complexity of a full API.",
    },
    {
        icon: MonitorSmartphone,
        title: "Frontend",
        name: "React & Tailwind CSS",
        description:
            "A dynamic duo for building fast and responsive UIs. React powers the frontend with its component-based architecture, making state management and interactivity seamless, while Tailwind CSS provides utility-first styling for rapid and consistent design without writing custom CSS.",
    },
    {
        icon: Database,
        title: "Database",
        name: "MariaDB",
        description:
            "A fast, open-source relational database management system (RDBMS) that is a drop-in replacement for MySQL. It offers high performance, scalability, and strong security features, making it ideal for modern applications.",
    },
    {
        icon: Palette,
        title: "UI Components",
        name: "shadcn/ui",
        description:
            "Accessible, customizable components built on Radix UI and styled with Tailwind CSS. They keep the interface consistent across themes and screen sizes while letting us own every line of component code.",
    },
];

const developers = [
    {
        name: "Yasin Hassim",
        role: "Fullstack Developer",
        persona: "Tank, Support - Mobile Legend | Camper, Sniper - CODM",
        image: "/images/profile02.jpg",
        quote:
            "I fix printers, code apps, and occasionally talk to computers like they understand me. When I'm not debugging, I'm probably debugging my own life decisions.",
        links: [
            { label: "GitHub", href: "https://github.com/YsinHsim", icon: GitFork },
            { label: "WhatsApp", href: "https://wa.me/60128507469", icon: MessageCircle },
            { label: "Email", href: "mailto:yasinhassim43@gmail.com", icon: Mail },
            { label: "Portfolio", href: "https://yasinhassim.vercel.app/", icon: ExternalLink },
        ],
    },
    {
        name: "Khairulazhar",
        role: "Front-end Developer, UI & UX Designer",
        persona: "Hyper, Mage, Marksman - Mobile Legend",
        image: "/images/khai-profile01.jpeg",
        quote: "I'm just a humble Intern.",
        links: [
            { label: "GitHub", href: "https://github.com/khai218", icon: GitFork },
            { label: "WhatsApp", href: "https://wa.me/60135552635", icon: MessageCircle },
            { label: "Email", href: "mailto:khairulazhar2004@gmail.com", icon: Mail },
        ],
    },
];

export default function About() {
    return (
        <Layout>
            <motion.div variants={fadeRise} initial="hidden" animate="show" transition={spring}>
                <div>
                    <h1 className="font-heading text-3xl font-semibold">Hardware Tracking System</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Simplify the way you track and manage hardware across multiple locations.
                    </p>
                </div>

                <Separator className="my-6" />

                <section aria-labelledby="technologies-heading">
                    <h2 id="technologies-heading" className="font-heading text-xl font-semibold">
                        Technologies Used
                    </h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {technologies.map(({ icon: Icon, title, name, description }) => (
                            <Card key={title}>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                                            <Icon className="size-5" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <p className="font-heading text-base font-medium">{title}</p>
                                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <ArrowRight className="size-3.5" aria-hidden="true" />
                                                {name}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <Separator className="my-6" />

                <section aria-labelledby="developer-heading">
                    <h2 id="developer-heading" className="font-heading text-xl font-semibold">
                        Developer
                    </h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {developers.map((developer) => (
                            <Card key={developer.name}>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={developer.image}
                                            alt={developer.name}
                                            className="size-24 rounded-full object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className="font-heading text-xl font-medium">{developer.name}</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">Role:</span> {developer.role}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground">Persona:</span> {developer.persona}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm italic text-muted-foreground">{developer.quote}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {developer.links.map(({ label, href, icon: Icon }) => (
                                            <Button key={label} variant="outline" size="sm" asChild>
                                                <a href={href} target="_blank" rel="noopener noreferrer">
                                                    <Icon aria-hidden="true" />
                                                    {label}
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </motion.div>
        </Layout>
    );
}
