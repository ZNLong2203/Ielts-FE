interface CourseStageProps {
  stageQuantity: number;
}

const stageContent = [
  {
    title: "Chapter 1",
    description: "IELTS Fundamentals",
    lessons: 18,
    lessonsDescription: "Mastery through communication",
  },
  {
    title: "Chapter 2",
    description: "Basic IELTS",
    lessons: 20,
    lessonsDescription: "Skill development",
  },
  {
    title: "Chapter 3",
    description: "Intermediate IELTS",
    lessons: 15,
    lessonsDescription: "Review and enhancement",
  },
  {
    title: "Chapter 4",
    description: "Advanced IELTS",
    lessons: 25,
    lessonsDescription: "Test-taking strategies",
  },
];


const CourseStage: React.FC<CourseStageProps> = ({ stageQuantity }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {stageContent.map((stage, index) => {
        if (index < stageQuantity) {
          return (
            <div className="text-center" key={index}>
              <div className="inline-block bg-blue-700 p-3 rounded-lg mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">{stage.title}</h3>
              <p className="mb-4">{stage.description}</p>

              <div className="bg-blue-700 rounded-lg p-4 flex items-center justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <line x1="3" x2="21" y1="9" y2="9"></line>
                  <line x1="9" x2="9" y1="21" y2="9"></line>
                </svg>
                <div className="text-left">
                  <p className="font-semibold">{stage.lessons} lessons</p>
                  <p className="text-xs">{stage.lessonsDescription}</p>
                </div>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default CourseStage;
