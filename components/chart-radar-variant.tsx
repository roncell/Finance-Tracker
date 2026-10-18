"use client";

import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import { INCOME_COLOR, SECONDARY_TEXT_COLOR } from "@/components/chart-colors";
import { CategoryTooltip } from "@/components/chart-tooltip";

type CategoryDatum = {
    name: string;
    value: number;
    categoryIds?: string[];
};

type Props = {
    data?: CategoryDatum[];
    onSelect?: (categoryIds: string[]) => void;
};

export const RadarVariant = ({ data = [], onSelect }: Props) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="60%"
                data={data}
                onClick={(state) => {
                    const index = Number(state?.activeTooltipIndex);
                    if (!Number.isInteger(index) || index < 0) return;
                    const entry = data[index];
                    if (entry?.categoryIds?.length) onSelect?.(entry.categoryIds);
                }}
                className={onSelect ? "cursor-pointer" : undefined}
            >
                <PolarGrid />
                <PolarAngleAxis
                    dataKey="name"
                    style={{ fontSize: "12px" }}
                    tick={{ fill: SECONDARY_TEXT_COLOR }}
                />
                <PolarRadiusAxis style={{ fontSize: "12px" }} />
                <Radar
                    name="Amount"
                    dataKey="value"
                    stroke={INCOME_COLOR}
                    fill={INCOME_COLOR}
                    fillOpacity={0.4}
                />
                <Tooltip content={<CategoryTooltip />} />
            </RadarChart>
        </ResponsiveContainer>
    );
};
