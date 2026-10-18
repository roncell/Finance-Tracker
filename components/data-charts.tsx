"use client";

import { useState } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useDrillDown } from "@/features/summary/hooks/use-drill-down";
import { AreaVariant } from "@/components/chart-area-variant";
import { BarVariant } from "@/components/chart-bar-variant";
import { LineVariant } from "@/components/chart-line-variant";
import { PieVariant } from "@/components/chart-pie-variant";
import { RadarVariant } from "@/components/chart-radar-variant";
import { CategoryList } from "@/components/chart-category-list";
import { ChartEmptyState } from "@/components/chart-empty-state";

type ChartType = "area" | "bar" | "line";
type CategoryType = "pie" | "radar" | "list";

export const DataCharts = () => {
    const { data, isLoading } = useGetSummary();
    const { drillToCategory, drillToDay } = useDrillDown();
    const [chartType, setChartType] = useState<ChartType>("area");
    const [categoryType, setCategoryType] = useState<CategoryType>("pie");

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                <div className="col-span-1 lg:col-span-4">
                    <Card className="border shadow-sm h-[500px] animate-pulse">
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[350px] w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="col-span-1 lg:col-span-2">
                    <Card className="border shadow-sm transition-shadow duration-300 hover:shadow-md h-[500px]">
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[350px] w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const days = data?.days ?? [];
    const categories = data?.categories ?? [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            <div className="col-span-1 lg:col-span-4">
                <Card className="border shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-3 space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Income vs expenses</CardTitle>
                            <CardDescription>
                                Daily totals — click a day to see its transactions.
                            </CardDescription>
                        </div>
                        <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                            <SelectTrigger className="lg:w-auto h-9 rounded-md px-1.5">
                                <SelectValue placeholder="Chart type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="area">Area chart</SelectItem>
                                <SelectItem value="bar">Bar chart</SelectItem>
                                <SelectItem value="line">Line chart</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {days.length === 0 ? (
                            <ChartEmptyState />
                        ) : (
                            <>
                                {chartType === "area" && <AreaVariant data={days} onSelectDay={drillToDay} />}
                                {chartType === "bar" && <BarVariant data={days} onSelectDay={drillToDay} />}
                                {chartType === "line" && <LineVariant data={days} onSelectDay={drillToDay} />}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="col-span-1 lg:col-span-2">
                <Card className="border shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-3 space-y-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Top spending</CardTitle>
                            <CardDescription>
                                Click a category to see its transactions.
                            </CardDescription>
                        </div>
                        <Select value={categoryType} onValueChange={(value) => setCategoryType(value as CategoryType)}>
                            <SelectTrigger className="lg:w-auto h-9 rounded-md px-1.5">
                                <SelectValue placeholder="Chart type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pie">Pie chart</SelectItem>
                                <SelectItem value="radar">Radar chart</SelectItem>
                                <SelectItem value="list">Table</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {categories.length === 0 ? (
                            <ChartEmptyState />
                        ) : (
                            <>
                                {categoryType === "pie" && <PieVariant data={categories} onSelect={drillToCategory} />}
                                {categoryType === "radar" && <RadarVariant data={categories} onSelect={drillToCategory} />}
                                {categoryType === "list" && <CategoryList data={categories} onSelect={drillToCategory} />}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
