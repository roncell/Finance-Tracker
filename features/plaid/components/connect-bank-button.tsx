"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Landmark, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCreateLinkToken } from "../api/use-create-link-token";
import { useExchangePublicToken } from "../api/use-exchange-public-token";

export const ConnectBankButton = () => {
    const [linkToken, setLinkToken] = useState<string | null>(null);

    const createLinkToken = useCreateLinkToken();
    const exchangePublicToken = useExchangePublicToken();

    const onSuccess = useCallback((publicToken: string | null) => {
        if (!publicToken) return;

        exchangePublicToken.mutate({ publicToken });
        setLinkToken(null);
    }, [exchangePublicToken]);

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess,
    });

    useEffect(() => {
        if (ready && linkToken) {
            open();
        }
    }, [ready, linkToken, open]);

    const onClick = async () => {
        const token = await createLinkToken.mutateAsync();
        setLinkToken(token);
    };

    const isPending = createLinkToken.isPending || exchangePublicToken.isPending;

    return (
        <Button
            onClick={onClick}
            disabled={isPending}
            size="sm"
            variant="outline"
            className="w-full lg:w-auto"
        >
            {isPending ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
                <Landmark className="size-4 mr-2" />
            )}
            Connect bank
        </Button>
    );
};
