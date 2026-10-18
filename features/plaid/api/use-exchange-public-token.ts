import { InferRequestType, InferResponseType } from "hono/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.plaid.exchange["$post"]>;
type RequestType = InferRequestType<typeof client.api.plaid.exchange["$post"]>["json"];

export const useExchangePublicToken = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            const response = await client.api.plaid.exchange.$post({ json });

            if (!response.ok) {
                throw new Error("Failed to link bank account");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Bank connected successfully!");
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            queryClient.invalidateQueries({ queryKey: ["connected-banks"] });
        },
        onError: () => {
            toast.error("Failed to link bank account.");
        },
    });

    return mutation;
};
