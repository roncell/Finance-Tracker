"use client";

import { format } from "date-fns";

import { formatCurrency } from "@/lib/utils";

type TooltipEntry = {
    name?: string | number;
    value?: string | number;
    color?: string;
    dataKey?: string | number;
    payload?: { name?: string };
};

type Props = {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string | number;
};

const Shell = ({ heading, children }: { heading: string; children: React.ReactNode }) => (
    <div className="overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
        <div className="border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
            {heading}
        </div>
        <div className="space-y-1.5 p-3">{children}</div>
    </div>
);

const Row = ({
    color,
    label,
    value,
}: {
    color?: string;
    label: string;
    value: number;
}) => (
    <div className="flex items-center justify-between gap-x-6 text-sm">
        <div className="flex items-center gap-x-2">
            <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
            />
            <span className="text-muted-foreground">{label}</span>
        </div>
        <span className="font-medium tabular-nums">{formatCurrency(value)}</span>
    </div>
);

/** Tooltip for the date-series charts (area / bar / line). */
export const ChartTooltip = ({ active, payload, label }: Props) => {
    if (!active || !payload?.length) return null;

    const date = new Date(String(label));
    const heading = Number.isNaN(date.getTime())
        ? String(label)
        : format(date, "EEEE, MMM dd, yyyy");

    return (
        <Shell heading={heading}>
            {payload.map((entry, index) => (
                <Row
                    key={String(entry.dataKey ?? index)}
                    color={entry.color}
                    label={String(entry.name ?? "")}
                    value={Number(entry.value ?? 0)}
                />
            ))}
        </Shell>
    );
};

/** Tooltip for the category breakdown (pie / radar) — no date heading. */
export const CategoryTooltip = ({ active, payload }: Props) => {
    if (!active || !payload?.length) return null;

    const entry = payload[0];
    const name = entry.payload?.name ?? String(entry.name ?? "");

    return (
        <Shell heading={name}>
            <Row
                color={entry.color}
                label="Amount"
                value={Number(entry.value ?? 0)}
            />
        </Shell>
    );
};
