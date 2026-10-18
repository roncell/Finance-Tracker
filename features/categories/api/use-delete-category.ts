import { toast } from "sonner";
import { InferResponseType } from "hono/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.categories[":id"]["$delete"]>;

export const useDeleteCategory = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error
    >({
        mutationFn: async () => {
            if (!id) {
                throw new Error("Category ID is required to delete");
            }

            const response = await client.api.categories[":id"]["$delete"]({
                param: { id },
            });

            if (!response.ok) {
                throw new Error("Failed to delete category");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Category deleted successfully!");

            queryClient.invalidateQueries({ queryKey: ["category", { id }] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: () => {
            toast.error("Failed to delete category.");
        },
    });

    return mutation;
};
