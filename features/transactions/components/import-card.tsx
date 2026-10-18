"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ImportTable, ColumnOption } from "./import-table";

type Props = {
    data: string[][];
    onCancel: () => void;
    onSubmit: (data: { date: string; payee: string; amount: string }[]) => void;
};

const REQUIRED_COLUMNS: ColumnOption[] = ["date", "payee", "amount"];

export const ImportCard = ({ data, onCancel, onSubmit }: Props) => {
    const [selectedColumns, setSelectedColumns] = useState<Record<string, ColumnOption>>({});

    const headers = data[0] ?? [];
    const body = data
        .slice(1)
        .filter((row) => row.length === headers.length && row.some((cell) => cell.trim() !== ""));

    const onTableHeadSelectChange = (columnIndex: number, value: ColumnOption) => {
        setSelectedColumns((prev) => {
            const newColumns = { ...prev };

            if (value !== "skip") {
                for (const key in newColumns) {
                    if (newColumns[key] === value) {
                        newColumns[key] = "skip";
                    }
                }
            }

            newColumns[`column_${columnIndex}`] = value;
            return newColumns;
        });
    };

    const progress = REQUIRED_COLUMNS.filter((required) =>
        Object.values(selectedColumns).includes(required)
    ).length;

    const handleContinue = () => {
        const columnEntries = Object.entries(selectedColumns).map(
            ([key, value]) => [Number(key.split("_")[1]), value] as const,
        );

        const dateColumn = columnEntries.find(([, value]) => value === "date")?.[0];
        const payeeColumn = columnEntries.find(([, value]) => value === "payee")?.[0];
        const amountColumn = columnEntries.find(([, value]) => value === "amount")?.[0];

        if (dateColumn === undefined || payeeColumn === undefined || amountColumn === undefined) {
            return;
        }

        const formattedData = body.map((row) => ({
            date: row[dateColumn],
            payee: row[payeeColumn],
            amount: row[amountColumn],
        }));

        onSubmit(formattedData);
    };

    return (
        <div className="relative max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border shadow-sm">
                <CardHeader className="flex flex-col lg:flex-row items-center justify-between gap-y-2">
                    <CardTitle className="text-xl line-clamp-1">
                        Import Transactions
                    </CardTitle>
                    <div className="flex items-center gap-x-2 w-full lg:w-auto">
                        <Button
                            size="sm"
                            onClick={onCancel}
                            className="flex-1 shrink lg:flex-none lg:w-auto"
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            disabled={progress < REQUIRED_COLUMNS.length}
                            onClick={handleContinue}
                            className="flex-1 shrink lg:flex-none lg:w-auto"
                        >
                            Continue ({progress} / {REQUIRED_COLUMNS.length})
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ImportTable
                        headers={headers}
                        body={body}
                        selectedColumns={selectedColumns}
                        onTableHeadSelectChange={onTableHeadSelectChange}
                    />
                </CardContent>
            </Card>
        </div>
    );
};
