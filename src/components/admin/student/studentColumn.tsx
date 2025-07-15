"use client";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import CellAction from "./studentAction";
import { IUser } from "@/interface/user";


export const columns: ColumnDef<IUser>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "full_name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "avatar",
    header: "Avatar",
    cell: ({ row }) => {
      return row.original.avatar ? (
        <Image
          src={row.original.avatar}
          alt={row.original.avatar || "No name"}
          height={70}
          width={70}
          className="rounded-full"
        />
      ) : (
        <div className="flex items-center justify-center h-[50px] w-[50px]">
          <span className="text-gray-500">No Image</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email_verified",
    header: "Verified",
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];