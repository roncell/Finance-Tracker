// Fixed categorical order — never cycled or reassigned by rank.
export const CATEGORICAL_COLORS = [
    "#2a78d6", // slot 1 — blue
    "#eb6834", // slot 2 — orange
    "#1baf7a", // slot 3 — aqua
];

export const MUTED_COLOR = "#898781";
export const GOOD_COLOR = "#0ca30c";
export const CRITICAL_COLOR = "#d03b3b";
export const GRIDLINE_COLOR = "#e1e0d9";
export const AXIS_COLOR = "#c3c2b7";
export const SECONDARY_TEXT_COLOR = "#52514e";
export const PRIMARY_TEXT_COLOR = "#0b0b0b";

export const INCOME_COLOR = CATEGORICAL_COLORS[0];
export const EXPENSES_COLOR = CATEGORICAL_COLORS[1];

export function categoryColor(name: string, index: number) {
    if (name === "Other") return MUTED_COLOR;
    return CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
}
