"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { categoryColor } from "@/components/chart-colors";
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

export const PieVariant = ({ data = [], onSelect }: Props) => {
    const handleSelect = (entry: CategoryDatum) => {
        if (entry.categoryIds?.length) onSelect?.(entry.categoryIds);
    };

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px" }}
                />
                <Tooltip content={<CategoryTooltip />} />
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    onClick={(_, index) => handleSelect(data[index])}
                    className={onSelect ? "cursor-pointer outline-none" : undefined}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${entry.name}`}
                            fill={categoryColor(entry.name, index)}
                            stroke="var(--card)"
                            strokeWidth={2}
                            className="transition-opacity hover:opacity-80"
                        />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};
