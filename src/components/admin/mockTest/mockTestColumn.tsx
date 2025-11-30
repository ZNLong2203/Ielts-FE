"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Calendar, Shield } from "lucide-react";
import CellAction from "./mockTestAction";
import { IMockTest } from "@/interface/mockTest";

export const columns: ColumnDef<IMockTest>[] = [
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
    cell: ({ row }) => {
      const title = row.original.title;

      return (
        <div className="flex items-center gap-2">
          <div className="font-medium">{title}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Durations (mins)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.duration
          ? `${Number(row.original.duration).toLocaleString()} mins`
          : "N/A"}
      </div>
    ),
  },

  {
    accessorKey: "difficulty_level",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-secondary/20"
        >
          Difficulty Level
        </Button>
      );
    },
    cell: ({ row }) => {
      const difficultyLevel = row.original.difficulty_level;
      
      const difficultyMap: Record<string, string> = {
        "easy": "beginner",
        "medium": "intermediate",
        "expert": "advanced",
      };
      
      let displayText = difficultyLevel;
      
      if (difficultyLevel && typeof difficultyLevel === "string") {
        const match = difficultyLevel.match(/Level \d+ \((.+?)\)/);
        if (match) {
          const label = match[1].toLowerCase();
          displayText = difficultyMap[label] || label;
        } else {
          const lowerLevel = difficultyLevel.toLowerCase();
          displayText = difficultyMap[lowerLevel] || lowerLevel;
        }
      }
      
      return (
        <div className="text-sm font-medium capitalize">
          {displayText || "N/A"}
        </div>
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
        {row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString()
          : "N/A"}
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
