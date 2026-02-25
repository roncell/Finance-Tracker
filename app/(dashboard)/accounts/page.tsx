"use client";

import { Loader2, Plus } from "lucide-react";
import { useNewAccount } from "@/features/accounts/hooks/use-new-acc";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";

const AccountsPage = () => {
    const newAccount = useNewAccount();
    const deleteAccounts = useBulkDeleteAccounts();
    const accountsQuery = useGetAccounts();
    
    const accounts = accountsQuery.data || [];
    
    const isDisabled = accountsQuery.isLoading || deleteAccounts.isPending;

    if (accountsQuery.isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border-none drop-shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xl line-clamp-1">
                            Accounts page
                        </CardTitle>
                        <Button onClick={newAccount.onOpen} size="sm">
                            <Plus className="size-4 mr-2" />
                            Add new
                        </Button>
                    </CardHeader>
                    <CardContent className="h-[500px] flex items-center justify-center">
                        <Loader2 className="size-6 text-slate-300 animate-spin" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border-none drop-shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl line-clamp-1">
                        Accounts page
                    </CardTitle>
                    <Button onClick={newAccount.onOpen} size="sm">
                        <Plus className="size-4 mr-2" />
                        Add new
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable 
                        columns={columns} 
                        data={accounts} 
                        disabled={isDisabled}
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