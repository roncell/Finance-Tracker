"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const AccountFilter = () => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const accountId = params.get("accountId") || "all";

    const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts();

    const onChange = (newValue: string) => {
        // Start from the current params so unrelated filters (date range, the
        // category drill-down) survive changing the account.
        const newParams = new URLSearchParams(params.toString());

        if (newValue === "all") {
            newParams.delete("accountId");
        } else {
            newParams.set("accountId", newValue);
        }

        router.push(`${pathname}?${newParams.toString()}`);
    };

    return (
        <Select
            value={accountId}
            onValueChange={onChange}
            disabled={isLoadingAccounts}
        >
            <SelectTrigger className="lg:w-auto w-full h-9">
                <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                        {account.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
