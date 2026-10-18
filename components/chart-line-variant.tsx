"use client";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
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

export const LineVariant = ({ data = [], onSelectDay }: Props) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart
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
                    cursor={{ stroke: GRIDLINE_COLOR, strokeWidth: 1 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Line
                    dataKey="income"
                    name="Income"
                    stroke={INCOME_COLOR}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                />
                <Line
                    dataKey="expenses"
                    name="Expenses"
                    stroke={EXPENSES_COLOR}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};
