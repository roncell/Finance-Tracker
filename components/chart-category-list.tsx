"use client";

import { ChevronRight } from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import { categoryColor } from "@/components/chart-colors";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type CategoryDatum = {
    name: string;
    value: number;
    categoryIds?: string[];
};

type Props = {
    data?: CategoryDatum[];
    onSelect?: (categoryIds: string[]) => void;
};

export const CategoryList = ({ data = [], onSelect }: Props) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((item, index) => {
                    const clickable = Boolean(onSelect && item.categoryIds?.length);

                    return (
                        <TableRow
                            key={item.name}
                            onClick={() => clickable && onSelect?.(item.categoryIds!)}
                            className={cn(
                                "transition-colors",
                                clickable && "cursor-pointer hover:bg-muted/50",
                            )}
                        >
                            <TableCell>
                                <div className="flex items-center gap-x-2">
                                    <span
                                        className="size-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: categoryColor(item.name, index) }}
                                    />
                                    <span className="truncate">{item.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatCurrency(item.value)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                <span className="inline-flex items-center justify-end gap-x-1">
                                    {total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : "0%"}
                                    {clickable && (
                                        <ChevronRight className="size-3.5 text-muted-foreground" />
                                    )}
                                </span>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};
