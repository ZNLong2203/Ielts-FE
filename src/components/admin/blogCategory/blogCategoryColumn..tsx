"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TextBadgeInfo } from "@/components/ui/info";
import { Calendar, Shield } from "lucide-react";
import CellAction from "./blogCategoryAction";
import { IBlogCategory } from "@/interface/blogCategory";

export const columns: ColumnDef<IBlogCategory>[] = [
  // ID Column
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          <Shield className="text-muted-foreground" />
          ID
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-xs font-mono text-muted-foreground">
        {row.original.id}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Name
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm font-medium text-primary">
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-pointer">
            {row.original.slug || "No slug"}
          </TooltipTrigger>
          <TooltipContent>{row.original.slug}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "ordering",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-secondary/20"
      >
        Ordering
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.ordering !== undefined
          ? row.original.ordering
          : "No ordering"}
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <Button variant="ghost" className="hover:bg-secondary/20">
        Status
      </Button>
    ),
    cell: ({ row }) => (
      <TextBadgeInfo status={row.original.is_active ? "active" : "inactive"} />
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-secondary/20"
      >
        <Calendar className="text-muted-foreground" />
        Created At
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.original.created_at).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
