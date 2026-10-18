"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { useGetCategories } from "@/features/categories/api/use-get-categories";

/**
 * Drilling in from a dashboard chart lands here with a category filter applied.
 * Without a visible, clearable marker the shortened list just looks like
 * missing data, so surface it explicitly.
 */
export const ActiveCategoryFilter = () => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const categoryParam = params.get("categoryId");
    const categoriesQuery = useGetCategories();

    if (!categoryParam) return null;

    const ids = categoryParam.split(",").filter(Boolean);
    const byId = new Map((categoriesQuery.data ?? []).map((c) => [c.id, c.name]));

    const names = ids.map((id) => byId.get(id)).filter(Boolean) as string[];
    const label = names.length ? names.join(", ") : `${ids.length} categories`;

    const onClear = () => {
        const next = new URLSearchParams(params.toString());
        next.delete("categoryId");
        const query = next.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    return (
        <Badge
            variant="secondary"
            className="gap-x-1.5 py-1.5 pr-1.5 pl-3 text-xs font-normal"
        >
            <span className="text-muted-foreground">Category:</span>
            <span className="max-w-[22rem] truncate font-medium">{label}</span>
            <button
                type="button"
                onClick={onClear}
                aria-label="Clear category filter"
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
            >
                <X className="size-3.5" />
            </button>
        </Badge>
    );
};
