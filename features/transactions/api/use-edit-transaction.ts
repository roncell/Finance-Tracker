import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.transactions[":id"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api.transactions[":id"]["$patch"]>["json"];

export const useEditTransaction = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            if (!id) {
                throw new Error("Transaction ID is required to edit");
            }

            const response = await client.api.transactions[":id"]["$patch"]({
                param: { id },
                json
            });

            if (!response.ok) {
                throw new Error("Failed to edit transaction");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Transaction updated successfully!");

            queryClient.invalidateQueries({ queryKey: ["transaction", { id }] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
        },
        onError: () => {
            toast.error("Failed to edit transaction.");
        },
    });

    return mutation;
};
