"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Calendar, Shield } from "lucide-react";
import CellAction from "@/components/admin/blog/blogAction";
import { TextBadgeInfo } from "@/components/ui/info";
import { IBlog } from "@/interface/blog";

export const columns: ColumnDef<IBlog>[] = [
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
    accessorKey: "author_id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Author ID
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-xs font-mono text-muted-foreground">
        {row.original.author_id}
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Title
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm font-medium text-gray-900">
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: "likeCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Like count
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.original.like_count || "N/A"}</div>
    ),
  },
  {
    accessorKey: "is_featured",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Featured
        </Button>
      );
    },
    cell: ({ row }) => (
      <TextBadgeInfo status={row.original.is_featured ? "True" : "False"} />
    ),
  },
  {
    accessorKey: "published_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          <Calendar className="text-muted-foreground" />
          Published At
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm  text-muted-foreground">
        {row.original.published_at
          ? new Date(row.original.published_at).toLocaleDateString()
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Status
        </Button>
      );
    },
    cell: ({ row }) => (
      <TextBadgeInfo status={row.original.status || "draft"} />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
    header: "Actions",
  },
];
