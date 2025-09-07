"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Calendar, Shield } from "lucide-react";
import CellAction from "@/components/admin/course/courseAction";
import { TextBadgeInfo } from "@/components/ui/info";
import { ICourse } from "@/interface/course";

export const columns: ColumnDef<ICourse>[] = [
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
  // Title
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
  // Difficulty Level
  {
    accessorKey: "difficulty_level",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Difficulty
        </Button>
      );
    },
    cell: ({ row }) => {
      const level = row.original.difficulty_level;
      const getBadgeColor = (level: string) => {
        switch (level?.toLowerCase()) {
          case "beginner":
            return "bg-green-100 text-green-800";
          case "intermediate":
            return "bg-yellow-100 text-yellow-800";
          case "advanced":
            return "bg-red-100 text-red-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(
            level
          )}`}
        >
          {level || "Not Set"}
        </span>
      );
    },
  },

  // Price
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Price
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.original.price;
      return (
        <div className="text-sm font-medium text-gray-900">
          {price ? `${Number(price).toLocaleString()} VND` : "Free"}
        </div>
      );
    },
  },
  // Discount Price
  {
    accessorKey: "discount_price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Discount Price
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.original.discount_price;
      return (
        <div className="text-sm font-medium text-gray-900">
          {price ? `${Number(price).toLocaleString()} VND` : "Free"}
        </div>
      );
    },
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
