"use client";

import { Suspense, useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { toast } from "sonner";

import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useSelectAccount } from "@/features/transactions/hooks/use-select-account";
import { UploadButton, UploadResult } from "@/features/transactions/components/upload-button";
import { ImportCard } from "@/features/transactions/components/import-card";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Filters } from "@/components/filters";
import { ActiveCategoryFilter } from "@/components/active-category-filter";
import { DataTable } from "@/components/data-table";
import { TableSkeleton } from "@/components/table-skeleton";
import { EmptyState } from "@/components/empty-state";
import { convertAmountToMiliunits, parseCsvAmount, parseCsvDate } from "@/lib/utils";

import { columns } from "./columns";

enum VARIANTS {
    LIST = "LIST",
    IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULTS: UploadResult = {
    data: [],
};

const TransactionsPage = () => {
    return (
        <Suspense>
            <TransactionsPageContent />
        </Suspense>
    );
};

const TransactionsPageContent = () => {
    const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
    const [importResults, setImportResults] = useState<UploadResult>(INITIAL_IMPORT_RESULTS);

    const [ConfirmDialog, confirm] = useSelectAccount();

    const onUpload = (results: UploadResult) => {
        setImportResults(results);
        setVariant(VARIANTS.IMPORT);
    };

    const onCancelImport = () => {
        setImportResults(INITIAL_IMPORT_RESULTS);
        setVariant(VARIANTS.LIST);
    };

    const newTransaction = useNewTransaction();
    const deleteTransactions = useBulkDeleteTransactions();
    const createTransactions = useBulkCreateTransactions();
    const transactionsQuery = useGetTransactions();

    const transactions = transactionsQuery.data || [];

    const isDisabled = transactionsQuery.isLoading || deleteTransactions.isPending;

    const onSubmitImport = async (
        values: { date: string; payee: string; amount: string }[],
    ) => {
        const accountId = await confirm();

        if (!accountId) {
            return;
        }

        // Skip rows whose date or amount can't be read rather than importing a
        // silently wrong value (a bad date used to become "today", and
        // "1,234.56" used to become 1).
        const data: {
            accountId: string;
            categoryId: null;
            payee: string;
            notes: null;
            date: Date;
            amount: number;
        }[] = [];
        let skipped = 0;

        for (const value of values) {
            const date = parseCsvDate(value.date);
            const amount = parseCsvAmount(value.amount);

            if (!date || amount === null) {
                skipped++;
                continue;
            }

            data.push({
                accountId,
                categoryId: null,
                payee: value.payee,
                notes: null,
                date,
                amount: convertAmountToMiliunits(amount),
            });
        }

        if (data.length === 0) {
            toast.error("No rows could be imported — check the date and amount columns.");
            return;
        }

        createTransactions.mutate(data, {
            onSuccess: () => {
                if (skipped > 0) {
                    toast.warning(`${skipped} row(s) skipped — unreadable date or amount.`);
                }
                onCancelImport();
            },
        });
    };

    if (transactionsQuery.isLoading) {
        return (
            <div className="relative max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Transactions</CardTitle>
                        <CardDescription>
                            Every transaction across your accounts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TableSkeleton columns={5} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (variant === VARIANTS.IMPORT) {
        return (
            <>
                <ConfirmDialog />
                <ImportCard
                    data={importResults.data}
                    onCancel={onCancelImport}
                    onSubmit={onSubmitImport}
                />
            </>
        );
    }

    return (
        <div className="relative max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <ConfirmDialog />
            <Card className="border shadow-sm">
                <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-4">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Transactions</CardTitle>
                        <CardDescription>
                            Every transaction across your accounts.
                        </CardDescription>
                    </div>
                    <div className="flex flex-col lg:flex-row items-center gap-y-2 lg:gap-x-2 w-full lg:w-auto">
                        <Button onClick={newTransaction.onOpen} size="sm" className="w-full lg:w-auto">
                            <Plus className="size-4 mr-2" />
                            Add new
                        </Button>
                        <UploadButton onUpload={onUpload} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-y-3 pb-4 lg:flex-row lg:items-center lg:justify-between">
                        <Filters />
                        <ActiveCategoryFilter />
                    </div>
                    <DataTable
                        columns={columns}
                        data={transactions}
                        filterKey="payee"
                        filterPlaceholder="Filter by payee..."
                        disabled={isDisabled}
                        emptyState={
                            <EmptyState
                                icon={Receipt}
                                title="No transactions in this period"
                                description="Try widening the date range, or add a transaction manually. You can also import a CSV or sync a connected bank."
                                action={
                                    <Button onClick={newTransaction.onOpen} size="sm">
                                        <Plus className="size-4 mr-2" />
                                        Add a transaction
                                    </Button>
                                }
                            />
                        }
                        onDelete={(rows) => {
                            const ids = rows.map((row) => row.id);
                            deleteTransactions.mutate({ ids });
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default TransactionsPage;
