import LoadingSpinner from "@/components/courses/LoadingSpinner"

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    </div>
  )
}