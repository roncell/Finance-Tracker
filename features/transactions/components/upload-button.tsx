"use client";

import { useRef } from "react";
import Papa from "papaparse";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

export type UploadResult = {
    data: string[][];
};

type Props = {
    onUpload: (results: UploadResult) => void;
};

export const UploadButton = ({ onUpload }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        Papa.parse<string[]>(file, {
            complete: (results) => {
                onUpload({ data: results.data });
            },
        });

        e.target.value = "";
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleChange}
            />
            <Button
                size="sm"
                className="w-full lg:w-auto"
                onClick={() => inputRef.current?.click()}
            >
                <Upload className="size-4 mr-2" />
                Import
            </Button>
        </>
    );
};
