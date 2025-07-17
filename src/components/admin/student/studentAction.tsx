"use client";
import { Copy, Edit, Eye, Info, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modal/alert-modal";

import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { IUser } from "@/interface/user";
import { getQueryClient } from "@/utils/getQueryClient";
import { deleteStudent } from "@/api/student";
import ROUTES from "@/constants/route";

interface CellActionProps {
  data: IUser;
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const queryClient = getQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copied to clipboard");
  };

  const {
    mutate: deleteId,
    isError,
    isPending,
  } = useMutation({
    mutationFn: deleteStudent,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete student");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student"] });
      setOpen(false);
      toast.success("Student deleted successfully");
    },
  });

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => deleteId(data.id)}
        loading={isPending}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-1 h-4 w-4" />
            Copy ID
          </DropdownMenuItem>
           <DropdownMenuItem
            onClick={() => router.push(ROUTES.ADMIN_STUDENTS + `/${data.id}`)}
          >
            <Eye className="mr-1 h-4 w-4" />
            Detail
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(ROUTES.ADMIN_STUDENTS + `/${data.id}/update`)}
          >
            <Edit className="mr-1 h-4 w-4" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(true);
            }}
          >
            <Trash className="mr-1 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellAction;
