import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono/client"; 
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.accounts[":id"]["$patch"]>;
type RequestType = InferRequestType<typeof client.api.accounts[":id"]["$patch"]>["json"];

export const useEditAccount = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async (json) => {
            if (!id) {
                throw new Error("Account ID is required to edit");
            }

            const response = await client.api.accounts[":id"]["$patch"]({ 
                param: { id },
                json 
            });
            
            if (!response.ok) {
                throw new Error("Failed to edit account");
            }
            
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Account updated successfully!");
            
            queryClient.invalidateQueries({ queryKey: ["account", { id }] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
        },
        onError: () => {
            toast.error("Failed to edit account.");
        },
    });

    return mutation;
};