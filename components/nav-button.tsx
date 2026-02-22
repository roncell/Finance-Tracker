import Link from "next/link";
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
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-transparent text-white/80 hover:bg-white/10 hover:text-white"
            )}
        >
            {label}
        </Link>
    );
};