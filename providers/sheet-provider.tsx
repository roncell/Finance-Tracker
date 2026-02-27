"use client";

import { NewAccountSheet } from "@/features/accounts/components/new-acc-sheet";
import { EditAccountSheet } from "@/features/accounts/components/edit-acc";
import {useMountedState} from "react-use";

export const SheetProvider = () => {
    const isMounted = useMountedState();

    if (!isMounted) return null;
    
    return (
        <>
        <NewAccountSheet />
        <EditAccountSheet/>
        </>
    );
};