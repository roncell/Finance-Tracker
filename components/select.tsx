"use client";

import CreatableSelect from "react-select/creatable";
import { SingleValue } from "react-select";

type Option = {
    label: string;
    value: string;
};

type Props = {
    onChange: (value?: string) => void;
    onCreate?: (value: string) => void;
    options?: Option[];
    value?: string | null | undefined;
    disabled?: boolean;
    placeholder?: string;
};

export const Select = ({
    value,
    onChange,
    disabled,
    onCreate,
    options = [],
    placeholder,
}: Props) => {
    const onSelect = (option: SingleValue<Option>) => {
        onChange(option?.value);
    };

    const formattedValue = options.find((option) => option.value === value);

    return (
        <CreatableSelect
            placeholder={placeholder}
            className="text-sm h-10"
            styles={{
                control: (base) => ({
                    ...base,
                    borderColor: "#e2e8f0",
                    ":hover": {
                        borderColor: "#e2e8f0",
                    },
                }),
            }}
            value={formattedValue}
            onChange={onSelect}
            options={options}
            onCreateOption={onCreate}
            isDisabled={disabled}
        />
    );
};
