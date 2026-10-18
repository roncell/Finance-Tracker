"use client";

import { PiggyBank, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

import { formatDateRange } from "@/lib/utils";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useSearchParams } from "next/navigation";

import { DataCard, DataCardLoading } from "@/components/data-card";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
};

export const DataGrid = () => {
    const params = useSearchParams();
    const to = params.get("to") || undefined;
    const from = params.get("from") || undefined;

    const dateRangeLabel = formatDateRange({ to, from });

    const { data, isLoading } = useGetSummary();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
                <DataCardLoading />
                <DataCardLoading />
                <DataCardLoading />
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8"
        >
            <motion.div variants={item}>
                <DataCard
                    title="Remaining"
                    value={data?.remainingAmount}
                    icon={PiggyBank}
                    variant="default"
                    dateRange={dateRangeLabel}
                />
            </motion.div>
            <motion.div variants={item}>
                <DataCard
                    title="Income"
                    value={data?.incomeAmount}
                    icon={TrendingUp}
                    variant="success"
                    dateRange={dateRangeLabel}
                />
            </motion.div>
            <motion.div variants={item}>
                <DataCard
                    title="Expenses"
                    value={data?.expensesAmount}
                    icon={TrendingDown}
                    variant="danger"
                    dateRange={dateRangeLabel}
                />
            </motion.div>
        </motion.div>
    );
};
