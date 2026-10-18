"use client";

import { Landmark, RefreshCw, Unplug } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGetConnectedBanks } from "../api/use-get-connected-banks";
import { useSyncBank } from "../api/use-sync-bank";
import { useDisconnectBank } from "../api/use-disconnect-bank";

type Bank = {
    id: string;
    institutionName: string | null;
};

const ConnectedBankRow = ({ bank }: { bank: Bank }) => {
    const syncBank = useSyncBank(bank.id);
    const disconnectBank = useDisconnectBank(bank.id);

    return (
        <div className="flex flex-col gap-y-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-x-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background border">
                    <Landmark className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                        {bank.institutionName ?? "Connected bank"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Syncs accounts and transactions
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-x-2">
                <Button
                    size="sm"
                    variant="outline"
                    disabled={syncBank.isPending}
                    onClick={() => syncBank.mutate()}
                >
                    <RefreshCw
                        className={cn("size-4 mr-2", syncBank.isPending && "animate-spin")}
                    />
                    {syncBank.isPending ? "Syncing" : "Sync"}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    disabled={disconnectBank.isPending}
                    onClick={() => disconnectBank.mutate()}
                >
                    <Unplug className="size-4 mr-2" />
                    Disconnect
                </Button>
            </div>
        </div>
    );
};

export const ConnectedBanksList = () => {
    const banksQuery = useGetConnectedBanks();
    const banks = banksQuery.data ?? [];

    if (banks.length === 0) return null;

    return (
        <div className="mb-4 space-y-2">
            {banks.map((bank) => (
                <ConnectedBankRow key={bank.id} bank={bank} />
            ))}
        </div>
    );
};
