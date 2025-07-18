"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Mail, Phone, Calendar, User, Shield } from "lucide-react";
import CellAction from "./studentAction";
import { IUser } from "@/interface/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helper function để lấy badge variant dựa trên status
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "default";
    case "inactive":
      return "destructive";
  }
};

// Helper function để lấy initials từ full name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

export const columns: ColumnDef<IUser>[] = [
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
      <div className="text-xs font-mono text-muted-foreground">{row.original.id}</div>
    ),
  },
  
  // Full Name Column with Avatar
  {
    accessorKey: "full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          Name
        </Button>
      );
    },
    cell: ({ row }) => {
      const fullName = row.original.full_name;
      const avatar = row.original.avatar;
      
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-muted">
            {avatar ? (
              <AvatarImage src={avatar} alt={fullName} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(fullName || "Unknown User")}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="font-medium">{fullName}</div>
        </div>
      );
    },
  },
  
  // Email Column
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          <Mail className="h-4 w-4 text-muted-foreground" />
          Email
        </Button>
      );
    },
    cell: ({ row }) => {
      const email = row.original.email;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-default">
              <div className="text-sm truncate max-w-[180px]">{email}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{email}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  
  // Phone Column
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          <Phone className="h-4 w-4 text-muted-foreground" />
          Phone
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm font-mono">{row.original.phone}</div>
    ),
  },

  {
    accessorKey: "current_level",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Current Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.original.students?.current_level || "N/A"}</div>
    ),
  },
  
  {
    accessorKey: "target_ielts_score",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Target IELTS Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.original.students?.target_ielts_score || "N/A"}</div>
    ),
  },

  // Status Column with Badge
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusVariant(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
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
        {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "N/A"}
      </div>
    ),
  },
  
  // Actions Column
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];