import { FileSearch } from "lucide-react";

export const ChartEmptyState = () => {
    return (
        <div className="flex flex-col gap-y-3 items-center justify-center h-[350px] w-full rounded-lg border border-dashed">
            <div className="flex items-center justify-center size-12 rounded-full bg-muted">
                <FileSearch className="size-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm text-center">
                No data for this period.
            </p>
        </div>
    );
};
