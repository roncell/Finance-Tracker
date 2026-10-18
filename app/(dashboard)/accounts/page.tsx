"use client";

import { Plus, Wallet } from "lucide-react";
import { useNewAccount } from "@/features/accounts/hooks/use-new-acc";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete";
import { ConnectBankButton } from "@/features/plaid/components/connect-bank-button";
import { ConnectedBanksList } from "@/features/plaid/components/connected-banks-list";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { TableSkeleton } from "@/components/table-skeleton";
import { EmptyState } from "@/components/empty-state";

const AccountsPage = () => {
    const newAccount = useNewAccount();
    const deleteAccounts = useBulkDeleteAccounts();
    const accountsQuery = useGetAccounts();

    const accounts = accountsQuery.data || [];

    const isDisabled = accountsQuery.isLoading || deleteAccounts.isPending;

    if (accountsQuery.isLoading) {
        return (
            <div className="relative max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Accounts</CardTitle>
                        <CardDescription>
                            Bank and cash accounts your transactions belong to.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TableSkeleton columns={3} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="relative max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border shadow-sm">
                <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-4">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Accounts</CardTitle>
                        <CardDescription>
                            Bank and cash accounts your transactions belong to.
                        </CardDescription>
                    </div>
                    <div className="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-x-2 w-full lg:w-auto">
                        <Button onClick={newAccount.onOpen} size="sm" className="w-full lg:w-auto">
                            <Plus className="size-4 mr-2" />
                            Add new
                        </Button>
                        <ConnectBankButton />
                    </div>
                </CardHeader>
                <CardContent>
                    <ConnectedBanksList />
                    <DataTable
                        columns={columns}
                        data={accounts}
                        filterKey="name"
                        filterPlaceholder="Filter by name..."
                        disabled={isDisabled}
                        emptyState={
                            <EmptyState
                                icon={Wallet}
                                title="No accounts yet"
                                description="Add an account manually, or connect your bank to pull accounts and transactions in automatically."
                                action={
                                    <Button onClick={newAccount.onOpen} size="sm">
                                        <Plus className="size-4 mr-2" />
                                        Add an account
                                    </Button>
                                }
                            />
                        }
                        onDelete={(rows) => {
                            const ids = rows.map((row) => row.id);
                            deleteAccounts.mutate({ ids });
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountsPage;
