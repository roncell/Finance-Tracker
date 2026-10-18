"use client";

import { UserProfile } from "@clerk/nextjs";
import { Settings2 } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const SettingsPage = () => {
    return (
        <div className="relative max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border shadow-sm">
                <CardHeader className="flex flex-row items-center gap-x-3 space-y-0">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-blue-500/10">
                        <Settings2 className="size-5 text-blue-600" />
                    </div>
                    <div>
                        <CardTitle className="text-xl line-clamp-1">
                            Settings
                        </CardTitle>
                        <CardDescription>
                            Manage your profile, security, and sign-in methods.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-8">
                    <UserProfile
                        routing="hash"
                        appearance={{
                            elements: {
                                rootBox: "w-full flex justify-center",
                                card: "shadow-none border-none w-full",
                            },
                            variables: {
                                colorPrimary: "#4f46e5",
                            },
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
