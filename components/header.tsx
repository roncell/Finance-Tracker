import { UserButton, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Navigation } from "@/components/navigation";
import { WelcomeMsg } from "./welcome-msg";

export const Header = () => {
    return (
        <header className="bg-gradient-to-b from-slate-900 to-slate-700 px-4 py-8 lg:px-14 pb-36">
            <div className="max-w-screen-2xl mx-auto">
                <div className="w-full flex items-center justify-between mb-14">
                    <div className="flex items-center lg:gap-x-16">
                        <div className="hidden lg:flex items-center gap-x-2">
                            <span className="text-white text-2xl font-bold tracking-tight">
                                FinanceTracker
                            </span>
                        </div>
                        <Navigation />
                    </div>

                    <ClerkLoaded>
                        <UserButton afterSignOutUrl="/" />
                    </ClerkLoaded>
                    
                    <ClerkLoading>
                        <div className="size-8 animate-pulse bg-slate-500/50 rounded-full" />
                    </ClerkLoading>
                </div>
                <WelcomeMsg />
            </div>
        </header>
    );
};