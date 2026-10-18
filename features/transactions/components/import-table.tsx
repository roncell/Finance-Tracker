"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type ColumnOption = "skip" | "date" | "payee" | "amount";

const OPTIONS: { value: ColumnOption; label: string }[] = [
    { value: "skip", label: "Skip" },
    { value: "date", label: "Date" },
    { value: "payee", label: "Payee" },
    { value: "amount", label: "Amount" },
];

type Props = {
    headers: string[];
    body: string[][];
    selectedColumns: Record<string, ColumnOption>;
    onTableHeadSelectChange: (columnIndex: number, value: ColumnOption) => void;
};

export const ImportTable = ({
    headers,
    body,
    selectedColumns,
    onTableHeadSelectChange,
}: Props) => {
    return (
        <div className="rounded-md border overflow-hidden max-h-[500px] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map((_, index) => (
                            <TableHead key={index}>
                                <Select
                                    value={selectedColumns[`column_${index}`] ?? "skip"}
                                    onValueChange={(value: ColumnOption) =>
                                        onTableHeadSelectChange(index, value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Skip" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OPTIONS.map((option) => {
                                            const isAssignedElsewhere =
                                                option.value !== "skip" &&
                                                Object.entries(selectedColumns).some(
                                                    ([key, value]) =>
                                                        value === option.value &&
                                                        key !== `column_${index}`,
                                                );

                                            return (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                    disabled={isAssignedElsewhere}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </TableHead>
                        ))}
                    </TableRow>
                    <TableRow>
                        {headers.map((header, index) => (
                            <TableHead key={index} className="text-xs font-normal text-muted-foreground">
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {body.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
