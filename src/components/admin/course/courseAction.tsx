"use client";
import { Copy, Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ICourse } from "@/interface/course";
import { getQueryClient } from "@/utils/getQueryClient";
import ROUTES from "@/constants/route";
import { deleteAdminCourse } from "@/api/course";

interface CellActionProps {
  data: ICourse;
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const queryClient = getQueryClient();
  const router = useRouter();
  
  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copied to clipboard");
  };

  const { mutate: deleteId, isPending } = useMutation({
    mutationFn: deleteAdminCourse,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete course");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    },
  });

  const handleDelete = () => {
    deleteId(data.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => router.push(`${ROUTES.ADMIN_COURSES}/${data.id}`)}
          disabled={isPending}
        >
          <Eye className="mr-2 h-4 w-4" />
          Detail
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`${ROUTES.ADMIN_COURSES}/${data.id}/update`)}
          disabled={isPending}
        >
          <Edit className="mr-2 h-4 w-4" />
          Update
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopy(data.id)} disabled={isPending}>
          <Copy className="mr-2 h-4 w-4" />
          Copy ID
        </DropdownMenuItem>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
              className="text-red-600 focus:text-red-600 cursor-pointer"
              disabled={isPending}
            >
              <Trash className="mr-2 h-4 w-4" />
              {isPending ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Course?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete "{data.title}"? 
                This action cannot be undone and will remove all associated lessons and content.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete Course"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CellAction;