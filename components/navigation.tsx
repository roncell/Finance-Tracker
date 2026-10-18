"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";

import { NavButton } from "@/components/nav-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const routes = [
    { href: "/", label: "Overview" },
    { href: "/transactions", label: "Transactions" },
    { href: "/accounts", label: "Accounts" },
    { href: "/categories", label: "Categories" },
    { href: "/settings", label: "Settings" },
];

// Overview and Transactions both read the account/date-range filters from
// the URL. Plain nav links would drop those params on every tab switch, so
// carry the current filters along when navigating between these two pages.
const FILTERED_ROUTES = new Set(["/", "/transactions"]);

export const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const buildHref = (href: string) => {
        if (!FILTERED_ROUTES.has(href)) return href;

        const query = searchParams.toString();
        return query ? `${href}?${query}` : href;
    };

    const onClick = (href: string) => {
        router.push(buildHref(href));
        setIsOpen(false);
    };

    return (
        <>
            <div className="block lg:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition"
                        >
                            <Menu className="size-4" />
                        </Button>
                    </SheetTrigger>
                    
                    <SheetContent side="left" className="px-2">
                        <nav className="flex flex-col gap-y-2 pt-14">
                            {routes.map((route) => (
                                <Button
                                    key={route.href}
                                    variant={route.href === pathname ? "secondary" : "ghost"}
                                    onClick={() => onClick(route.href)}
                                    className="w-full justify-start transition-colors"
                                >
                                    {route.label}
                                </Button>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>

            <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
                {routes.map((route) => (
                    <NavButton
                        key={route.href}
                        href={buildHref(route.href)}
                        label={route.label}
                        isActive={pathname === route.href}
                    />
                ))}
            </nav>
        </>
    );
};