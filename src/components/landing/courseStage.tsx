import { motion } from "framer-motion";
import { BookOpen, CheckCircle, ChevronRight, Layers } from "lucide-react";

interface CourseStageProps {
  stageQuantity: number;
}

const stageContent = [
  {
    title: "Chapter 1",
    description: "IELTS Fundamentals",
    lessons: 18,
    lessonsDescription: "Mastery through communication",
    color: "from-blue-600 to-blue-400",
    icon: BookOpen,
    skills: ["Listening basics", "Reading comprehension", "Basic grammar"]
  },
  {
    title: "Chapter 2",
    description: "Basic IELTS",
    lessons: 20,
    lessonsDescription: "Skill development",
    color: "from-indigo-600 to-indigo-400",
    icon: Layers,
    skills: ["Vocabulary building", "Writing practice", "Speaking fluency"]
  },
  {
    title: "Chapter 3",
    description: "Intermediate IELTS",
    lessons: 15,
    lessonsDescription: "Review and enhancement",
    color: "from-purple-600 to-purple-400",
    icon: CheckCircle,
    skills: ["Task 1 & 2 strategies", "Advanced reading", "Complex grammar"]
  },
  {
    title: "Chapter 4",
    description: "Advanced IELTS",
    lessons: 25,
    lessonsDescription: "Test-taking strategies",
    color: "from-teal-600 to-teal-400",
    icon: BookOpen,
    skills: ["Mock test analysis", "Scoring techniques", "Advanced vocabulary"]
  },
];

const CourseStage: React.FC<CourseStageProps> = ({ stageQuantity }) => {
  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stageContent.map((stage, index) => {
        if (index < stageQuantity) {
          const Icon = stage.icon;
          
          return (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-white rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${stage.color} p-6 text-white relative`}>
                {/* Chapter number badge */}
                <div className="absolute top-3 right-3 bg-white/20 rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="ml-3 text-lg font-bold">{stage.title}</h3>
                </div>
                
                <p className="text-white/90 text-sm mb-3">{stage.description}</p>
                
                {/* Lesson count with rounded container */}
                <div className="inline-flex items-center bg-white/20 rounded-full px-3 py-1 text-sm">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{stage.lessons} lessons</span>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">You'll Learn</h4>
                  <ul className="space-y-2">
                    {stage.skills.map((skill, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <div className={`bg-gradient-to-r ${stage.color} p-1 rounded-full mr-2 flex-shrink-0`}>
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Focus</p>
                      <p className="text-sm text-gray-700">{stage.lessonsDescription}</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.1, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-gradient-to-r ${stage.color} text-white p-2 rounded-full shadow-md`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        }
        return null;
      })}
    </motion.div>
  );
};

export default CourseStage;