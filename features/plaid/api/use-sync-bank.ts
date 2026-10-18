import { InferResponseType } from "hono/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.plaid.sync[":bankId"]["$post"], 200>;

export const useSyncBank = (bankId?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            if (!bankId) {
                throw new Error("Bank ID is required to sync");
            }

            const response = await client.api.plaid.sync[":bankId"]["$post"]({
                param: { bankId },
            });

            if (!response.ok) {
                throw new Error("Failed to sync transactions");
            }

            return await response.json();
        },
        onSuccess: (result) => {
            toast.success(`Synced: ${result.data.created} new, ${result.data.updated} updated`);
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["summary"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: () => {
            toast.error("Failed to sync transactions.");
        },
    });

    return mutation;
};
