"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { formatDateRange, parseDateParam } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export const DateFilter = () => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const from = params.get("from") || "";
    const to = params.get("to") || "";

    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    const paramState = {
        from: from ? parseDateParam(from) : defaultFrom,
        to: to ? parseDateParam(to) : defaultTo,
    };

    const [date, setDate] = useState<DateRange | undefined>(paramState);

    // Keep the calendar's local selection in sync whenever the URL's from/to
    // change from outside this component (e.g. account filter re-pushes the
    // URL, or the page loads with params already set) — useState's initial
    // value is only used on the very first render otherwise. Adjusting state
    // during render (rather than in an effect) avoids an extra render pass.
    const [trackedParams, setTrackedParams] = useState({ from, to });
    if (trackedParams.from !== from || trackedParams.to !== to) {
        setTrackedParams({ from, to });
        setDate({ from: paramState.from, to: paramState.to });
    }

    const pushToUrl = (dateRange: DateRange | undefined) => {
        const query = {
            from: format(dateRange?.from || defaultFrom, "yyyy-MM-dd"),
            to: format(dateRange?.to || defaultTo, "yyyy-MM-dd"),
        };

        // Preserve unrelated filters (account, category drill-down).
        const newParams = new URLSearchParams(params.toString());
        newParams.set("from", query.from);
        newParams.set("to", query.to);

        router.push(`${pathname}?${newParams.toString()}`);
    };

    const onReset = () => {
        setDate(undefined);
        pushToUrl(undefined);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="lg:w-auto w-full h-9 font-normal"
                >
                    <span>{formatDateRange(paramState)}</span>
                    <ChevronDown className="ml-2 size-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="lg:w-auto w-full p-0" align="start">
                <Calendar
                    mode="range"
                    resetOnSelect
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    showOutsideDays={false}
                />
                <div className="p-4 w-full flex items-center gap-x-2">
                    <Button
                        onClick={onReset}
                        disabled={!date?.from || !date?.to}
                        className="flex-1 shrink"
                        variant="outline"
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={() => pushToUrl(date)}
                        disabled={!date?.from || !date?.to}
                        className="flex-1 shrink"
                    >
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
