"use client";

import { Edit, MoreHorizontal, Trash } from "lucide-react";

import { useOpenAccount } from "@/features/accounts/hooks/use-open-acc";
import { useDeleteAccount } from "@/features/accounts/api/use-delete-acc";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  id: string;
};

export const Actions = ({ id }: Props) => {
  const { onOpen } = useOpenAccount();
  const deleteMutation = useDeleteAccount(id);

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={deleteMutation.isPending}
          onClick={() => onOpen(id)}
        >
          <Edit className="size-4 mr-2" />
          Edit
        </DropdownMenuItem>
        
        <DropdownMenuItem
          disabled={deleteMutation.isPending}
          onClick={handleDelete}
        >
          <Trash className="size-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};