import { Suspense } from "react";
import { UserButton, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Landmark } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { WelcomeMsg } from "./welcome-msg";

export const Header = () => {
    return (
        <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-8 lg:px-14 pb-36">
            {/* Faint grid texture so the large banner doesn't read as a flat block */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                    backgroundSize: "56px 56px",
                    maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)",
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    background: "radial-gradient(600px circle at 15% 0%, rgba(99,102,241,0.25), transparent 60%)",
                }}
            />
            <div className="relative max-w-screen-2xl mx-auto">
                <div className="w-full flex items-center justify-between mb-14">
                    <div className="flex items-center lg:gap-x-16">
                        <div className="hidden lg:flex items-center gap-x-2.5">
                            <div className="flex items-center justify-center size-8 rounded-lg bg-white/10">
                                <Landmark className="size-4 text-white" />
                            </div>
                            <span className="text-white text-2xl font-bold tracking-tight">
                                FinanceTracker
                            </span>
                        </div>
                        <Suspense>
                            <Navigation />
                        </Suspense>
                    </div>

                    <div className="flex items-center gap-x-2">
                        <ThemeToggle />

                        <ClerkLoaded>
                            <UserButton afterSignOutUrl="/" />
                        </ClerkLoaded>

                        <ClerkLoading>
                            <div className="size-8 animate-pulse bg-slate-500/50 rounded-full" />
                        </ClerkLoading>
                    </div>
                </div>
                <WelcomeMsg />
            </div>
        </header>
    );
};