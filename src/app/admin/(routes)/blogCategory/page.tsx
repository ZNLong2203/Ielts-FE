import BlogCategoryTable from "@/components/admin/blogCategory/blogCategoryTable";

const BlogCategoryAdminPage = () => {
  return (
    <div className="flex-1 space-y-4 p-10 pt-6 h-full bg-white">
        <BlogCategoryTable />
    </div>
  );
};

export default BlogCategoryAdminPage;