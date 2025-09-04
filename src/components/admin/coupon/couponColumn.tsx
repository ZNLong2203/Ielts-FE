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
import { ArrowUpDown, Calendar, Shield } from "lucide-react";
import CellAction from "./couponAction";
import { ICoupon } from "@/interface/coupon";

export const columns: ColumnDef<ICoupon>[] = [
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
    accessorKey: "code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Code
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm font-medium text-primary">
        {row.original.code}
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
    accessorKey: "discount_type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-secondary/20"
      >
        Discount Type
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.discount_type}
      </div>
    ),
  },
  {
    accessorKey: "minimum_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Minimum Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.original.minimum_amount || "N/A"}</div>
    ),
  },
  {
    accessorKey: "maximum_discount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Maximum Discount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.original.maximum_discount || "N/A"}</div>
    ),
  },
  {
    accessorKey: "usage_limit",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Usage Limit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.original.usage_limit || "N/A"}</div>
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
