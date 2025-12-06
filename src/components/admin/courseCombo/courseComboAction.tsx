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
import { getQueryClient } from "@/utils/getQueryClient";
import ROUTES from "@/constants/route";
import { deleteCourseCombo } from "@/api/course";
import { IComboCourse } from "@/interface/course";

interface CellActionProps {
  data: IComboCourse;
}

const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const queryClient = getQueryClient();
  const router = useRouter();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copied to clipboard");
  };

  const {
    mutate: deleteId,
    isPending,
  } = useMutation({
    mutationFn: deleteCourseCombo,
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete combo course"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comboCourses"] });
      queryClient.invalidateQueries({ queryKey: ["courseCombos"] }); // Also invalidate course combos
      toast.success("Combo course deleted successfully");
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
          onClick={() => router.push(ROUTES.ADMIN_COURSE_COMBO + `/${data.id}`)}
          disabled={isPending}
        >
          <Eye className="mr-2 h-4 w-4" />
          Detail
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(ROUTES.ADMIN_COURSE_COMBO + `/${data.id}/update`)}
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
              <AlertDialogTitle>Delete Course Combo?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete "{data.name}" combo? 
                This action cannot be undone and will remove this course combination package.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Delete Combo"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CellAction;