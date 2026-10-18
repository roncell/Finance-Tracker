import { VariantProps, cva } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import CountUp from "react-countup";

import { cn, formatCurrency } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const accentVariant = cva("absolute inset-x-0 top-0 h-1", {
    variants: {
        variant: {
            default: "bg-blue-500",
            success: "bg-emerald-500",
            danger: "bg-rose-500",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

const glowVariant = cva(
    "pointer-events-none absolute -right-8 -top-8 size-32 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
    {
        variants: {
            variant: {
                default: "bg-blue-500/20",
                success: "bg-emerald-500/20",
                danger: "bg-rose-500/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

const boxVariant = cva(
    "shrink-0 rounded-lg p-2.5 transition-transform duration-300 group-hover:scale-110",
    {
        variants: {
            variant: {
                default: "bg-blue-500/10",
                success: "bg-emerald-500/10",
                danger: "bg-rose-500/10",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

const iconVariant = cva("size-5", {
    variants: {
        variant: {
            default: "text-blue-600 dark:text-blue-400",
            success: "text-emerald-600 dark:text-emerald-400",
            danger: "text-rose-600 dark:text-rose-400",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

type BoxVariants = VariantProps<typeof boxVariant>;
type IconVariants = VariantProps<typeof iconVariant>;

interface DataCardProps extends BoxVariants, IconVariants {
    icon: LucideIcon;
    title: string;
    value?: number;
    dateRange: string;
}

export const DataCard = ({
    icon: Icon,
    title,
    value = 0,
    variant,
    dateRange,
}: DataCardProps) => {
    return (
        <Card className="group relative gap-0 overflow-hidden border py-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className={cn(accentVariant({ variant }))} />
            <div className={cn(glowVariant({ variant }))} />

            <CardHeader className="relative flex flex-row items-start justify-between gap-x-4 px-6 pt-6">
                <div className="space-y-1">
                    <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                        {title}
                    </p>
                    <p className="text-xs text-muted-foreground/80">{dateRange}</p>
                </div>
                <div className={cn(boxVariant({ variant }))}>
                    <Icon className={cn(iconVariant({ variant }))} />
                </div>
            </CardHeader>

            <CardContent className="relative px-6 pt-4 pb-6">
                <p className="text-3xl font-bold tracking-tight break-all tabular-nums">
                    <CountUp
                        preserveValue
                        start={0}
                        end={value}
                        decimals={2}
                        duration={1}
                        formattingFn={formatCurrency}
                    />
                </p>
            </CardContent>
        </Card>
    );
};

export const DataCardLoading = () => {
    return (
        <Card className="gap-0 border py-0 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-x-4 px-6 pt-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="size-10 rounded-lg" />
            </CardHeader>
            <CardContent className="px-6 pt-4 pb-6">
                <Skeleton className="h-9 w-32" />
            </CardContent>
        </Card>
    );
};
