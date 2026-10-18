"use client";

import { NewAccountSheet } from "@/features/accounts/components/new-acc-sheet";
import { EditAccountSheet } from "@/features/accounts/components/edit-acc";
import { NewCategorySheet } from "@/features/categories/components/new-category-sheet";
import { EditCategorySheet } from "@/features/categories/components/edit-category-sheet";
import { NewTransactionSheet } from "@/features/transactions/components/new-transaction-sheet";
import { EditTransactionSheet } from "@/features/transactions/components/edit-transaction-sheet";
import {useMountedState} from "react-use";

export const SheetProvider = () => {
    const isMounted = useMountedState();

    if (!isMounted) return null;

    return (
        <>
        <NewAccountSheet />
        <EditAccountSheet/>
        <NewCategorySheet />
        <EditCategorySheet />
        <NewTransactionSheet />
        <EditTransactionSheet />
        </>
    );
};