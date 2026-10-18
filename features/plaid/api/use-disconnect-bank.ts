import { InferResponseType } from "hono/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.plaid[":bankId"]["$delete"]>;

export const useDisconnectBank = (bankId?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async () => {
            if (!bankId) {
                throw new Error("Bank ID is required");
            }

            const response = await client.api.plaid[":bankId"]["$delete"]({
                param: { bankId },
            });

            if (!response.ok) {
                throw new Error("Failed to disconnect bank");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Bank disconnected");
            queryClient.invalidateQueries({ queryKey: ["connected-banks"] });
        },
        onError: () => {
            toast.error("Failed to disconnect bank.");
        },
    });

    return mutation;
};
