"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { TextBadgeInfo } from "@/components/ui/info";
import { ArrowUpDown, Calendar, Shield } from "lucide-react";
import CellAction from "./orderAction";
import { IOrder } from "@/interface/order";

export const columns: ColumnDef<IOrder>[] = [
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
    accessorKey: "order_code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Order Code
        </Button>
      );
    },
    cell: ({ row }) => {
      const orderCode = row.original.order_code;

      return (
        <div className="flex items-center gap-2">
          <div className="font-medium">{orderCode}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.total_amount
          ? `${Number(row.original.total_amount).toLocaleString()} VND`
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "discount_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Discount Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.discount_amount
          ? `${Number(row.original.discount_amount).toLocaleString()} VND`
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "final_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Final Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.final_amount
          ? `${Number(row.original.final_amount).toLocaleString()} VND`
          : "N/A"}
      </div>
    ),
  },

  {
    accessorKey: "payment_method",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Payment Method
        </Button>
      );
    },
    cell: ({ row }) => {
      const paymentMethod = row.original.payment_method;

      return (
        <div className="flex items-center gap-2">
          <div className="font-medium">{paymentMethod}</div>
        </div>
      );
    },
  },
  // Status Column with Badge
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <TextBadgeInfo status={status} />;
    },
  },

  // Creation Date Column
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "N/A"}
      </div>
    ),
  },
];
