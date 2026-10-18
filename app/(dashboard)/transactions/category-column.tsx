"use client";

import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";

type Props = {
    id: string;
    category: string | null;
    categoryId: string | null;
};

export const CategoryColumn = ({ id, category, categoryId }: Props) => {
    const { onOpen: onOpenTransaction } = useOpenTransaction();

    const onClick = () => {
        onOpenTransaction(id);
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center cursor-pointer hover:underline",
                !categoryId && "text-rose-500",
            )}
        >
            {!categoryId && <TriangleAlert className="mr-2 size-4 shrink-0" />}
            {category || "Uncategorized"}
        </div>
    );
};
