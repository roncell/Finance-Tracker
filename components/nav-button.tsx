"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type Props = {
    href: string;
    label: string;
    isActive?: boolean;
};

export const NavButton = ({ href, label, isActive }: Props) => {
    return (
        <Link
            href={href}
            className={cn(
                "relative px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                isActive
                    ? "text-white"
                    : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white",
            )}
        >
            {isActive && (
                <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-md bg-white/20 shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
            )}
            <span className="relative z-10">{label}</span>
        </Link>
    );
};
