"use client";

import { Plus, Tags } from "lucide-react";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { TableSkeleton } from "@/components/table-skeleton";
import { EmptyState } from "@/components/empty-state";

const CategoriesPage = () => {
    const newCategory = useNewCategory();
    const deleteCategories = useBulkDeleteCategories();
    const categoriesQuery = useGetCategories();

    const categories = categoriesQuery.data || [];

    const isDisabled = categoriesQuery.isLoading || deleteCategories.isPending;

    if (categoriesQuery.isLoading) {
        return (
            <div className="relative max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Categories</CardTitle>
                        <CardDescription>
                            Group your spending so the breakdown chart is useful.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TableSkeleton columns={2} />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="relative max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
            <Card className="border shadow-sm">
                <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-y-4">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Categories</CardTitle>
                        <CardDescription>
                            Group your spending so the breakdown chart is useful.
                        </CardDescription>
                    </div>
                    <Button onClick={newCategory.onOpen} size="sm" className="w-full lg:w-auto">
                        <Plus className="size-4 mr-2" />
                        Add new
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={categories}
                        filterKey="name"
                        filterPlaceholder="Filter by name..."
                        disabled={isDisabled}
                        emptyState={
                            <EmptyState
                                icon={Tags}
                                title="No categories yet"
                                description="Categories are created automatically when you sync a bank, or you can add your own."
                                action={
                                    <Button onClick={newCategory.onOpen} size="sm">
                                        <Plus className="size-4 mr-2" />
                                        Add a category
                                    </Button>
                                }
                            />
                        }
                        onDelete={(rows) => {
                            const ids = rows.map((row) => row.id);
                            deleteCategories.mutate({ ids });
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default CategoriesPage;
