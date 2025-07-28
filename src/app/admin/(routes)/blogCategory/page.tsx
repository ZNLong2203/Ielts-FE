import BlogCategoryTable from "@/components/admin/blogCategory/blogCategoryTable";
import { Suspense } from "react";
import Loading from '@/components/ui/loading';

const BlogCategoryAdminPage = () => {
  return (
    <div className="flex-1 space-y-4 p-10 pt-6 h-full bg-white">
      <Suspense fallback={<Loading />}>
        <BlogCategoryTable />
      </Suspense>
    </div>
  );
};

export default BlogCategoryAdminPage;