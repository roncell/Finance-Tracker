import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { client } from "@/lib/hono";

export const useCreateLinkToken = () => {
    const mutation = useMutation({
        mutationFn: async () => {
            const response = await client.api.plaid.connect.$post();

            if (!response.ok) {
                throw new Error("Failed to create link token");
            }

            const { data } = await response.json();
            return data.linkToken;
        },
        onError: () => {
            toast.error("Failed to start bank connection.");
        },
    });

    return mutation;
};
