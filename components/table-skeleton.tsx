import { Skeleton } from "@/components/ui/skeleton";

type Props = {
    rows?: number;
    columns?: number;
};

export const TableSkeleton = ({ rows = 6, columns = 4 }: Props) => {
    return (
        <div className="space-y-4">
            <Skeleton className="h-9 w-full max-w-sm" />
            <div className="rounded-lg border overflow-hidden">
                <div className="divide-y">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex items-center gap-x-6 px-4 py-3.5">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <Skeleton
                                    key={colIndex}
                                    className="h-4 flex-1"
                                    style={{ animationDelay: `${(rowIndex * columns + colIndex) * 30}ms` }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
