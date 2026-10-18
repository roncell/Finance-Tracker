import { LucideIcon } from "lucide-react";

type Props = {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
};

export const EmptyState = ({ icon: Icon, title, description, action }: Props) => {
    return (
        <div className="flex flex-col items-center justify-center gap-y-3 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Icon className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {action ? <div className="pt-1">{action}</div> : null}
        </div>
    );
};
