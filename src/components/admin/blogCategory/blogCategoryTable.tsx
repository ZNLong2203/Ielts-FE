"use client";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Filter,
  Search,
  Mail,
  Phone,
} from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getBlogCategories } from "@/api/blogCategory";


const BlogCategoryTable = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;

    const { data, isPending, refetch } = useQuery({
        queryKey: ["blogCategories", page],
        queryFn: () => getBlogCategories({ page }),
    })

    return (
        <div>Oke</div>
    )
}

export default BlogCategoryTable;