"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { format } from "date-fns";

import { formatCompactCurrency } from "@/lib/utils";
import { ChartTooltip } from "@/components/chart-tooltip";
import {
    GRIDLINE_COLOR,
    INCOME_COLOR,
    EXPENSES_COLOR,
    SECONDARY_TEXT_COLOR,
} from "@/components/chart-colors";

type Props = {
    data?: {
        date: string;
        income: number;
        expenses: number;
    }[];
    onSelectDay?: (date: string) => void;
};

export const BarVariant = ({ data = [], onSelectDay }: Props) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
                data={data}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                onClick={(state) => {
                    if (state?.activeLabel) onSelectDay?.(String(state.activeLabel));
                }}
                className={onSelectDay ? "cursor-pointer" : undefined}
            >
                <CartesianGrid stroke={GRIDLINE_COLOR} strokeDasharray="3 3" vertical={false} />
                <XAxis
                    axisLine={false}
                    tickLine={false}
                    dataKey="date"
                    tickMargin={10}
                    minTickGap={24}
                    tickFormatter={(value) => format(new Date(value), "MMM dd")}
                    style={{ fontSize: "12px" }}
                    tick={{ fill: SECONDARY_TEXT_COLOR }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={64}
                    tickFormatter={(value) => formatCompactCurrency(Number(value))}
                    style={{ fontSize: "12px" }}
                    tick={{ fill: SECONDARY_TEXT_COLOR }}
                />
                <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: GRIDLINE_COLOR, opacity: 0.3 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar
                    dataKey="income"
                    name="Income"
                    fill={INCOME_COLOR}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                />
                <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill={EXPENSES_COLOR}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};
