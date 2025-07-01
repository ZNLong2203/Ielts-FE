import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface Course {
  id: number;
  category_id: number;
  title: string;
  description: string;
  difficulty_level: string;
  price: number;
  discountPrice?: number;
}

interface CourseCardProps {
  selectedLevel: number;
  selectedTarget: number;
  courseData: Course[];
}

const CourseCard: React.FC<CourseCardProps> = ({
  selectedLevel,
  selectedTarget,
  courseData,
}) => {
  const filteredCourses = courseData.filter((course) => {
    const [minLevel, maxLevel] = course.difficulty_level.split(" - ").map(Number);
    return minLevel == selectedLevel && maxLevel == selectedTarget;
  });

  // Function to format numbers with commas as thousand separators
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US").format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredCourses.map((course, index) => {
        return (
          <Card key={index} className="bg-white text-blue-900 rounded-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-bl-lg">
              Featured
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 p-2 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
                <h3 className="font-bold">{course.title}</h3>
              </div>

              <div className="mb-4">
                <p className="text-2xl font-bold">
                  {course.discountPrice ? formatCurrency(course.discountPrice) : "N/A"} <span className="text-gray-400 text-sm">VND</span>
                </p>
                <div className="flex items-center">
                  <p className="text-gray-400 text-sm line-through mr-2">
                    {formatCurrency(course.price)} VND
                  </p>
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                    -15%
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 mb-4">
                <Button className="flex-1 bg-blue-500 text-white hover:bg-blue-600">
                  Register Now
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Apply Coupon Code
                </Button>
              </div>

              <div className="space-y-3 text-sm">
                <h4 className="font-semibold">BENEFITS</h4>
                <div className="flex items-start">
                  <div className="bg-yellow-400 p-1 rounded-full mr-2 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>
                  <p>Own a specialized study curriculum</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-400 p-1 rounded-full mr-2 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>
                  <p>
                    Practice Listening & Reading tests with detailed answer explanations
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default CourseCard;
