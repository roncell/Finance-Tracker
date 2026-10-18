"use client";

import { useCallback } from "react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Navigation helpers for drilling from the dashboard charts into the matching
 * transactions. Existing filters (account, date range) are carried across so
 * the drill-down narrows the current view instead of resetting it.
 */
export const useDrillDown = () => {
    const router = useRouter();
    const params = useSearchParams();

    const drillToCategory = useCallback(
        (categoryIds: string[]) => {
            if (!categoryIds.length) return;

            const next = new URLSearchParams(params.toString());
            next.set("categoryId", categoryIds.join(","));
            router.push(`/transactions?${next.toString()}`);
        },
        [params, router],
    );

    const drillToDay = useCallback(
        (date: string | number | Date) => {
            const parsed = new Date(date);
            if (Number.isNaN(parsed.getTime())) return;

            const day = format(parsed, "yyyy-MM-dd");

            // Collapse the range to the single day that was clicked, keeping the
            // account filter but dropping any category narrowing.
            const next = new URLSearchParams(params.toString());
            next.delete("categoryId");
            next.set("from", day);
            next.set("to", day);
            router.push(`/transactions?${next.toString()}`);
        },
        [params, router],
    );

    return { drillToCategory, drillToDay };
};
