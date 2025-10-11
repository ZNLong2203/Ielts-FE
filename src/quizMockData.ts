export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "fill_in_blank" | "matching" | "true_false" | "listening_comprehension";
  question: string;
  audio_url?: string;
  image_url?: string;
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  points: number;
  time_limit?: number; // in seconds
  part?: string;
  section?: "listening" | "reading" | "writing" | "speaking";
}

export interface QuizData {
  id: string;
  title: string;
  description: string;
  section: "listening" | "reading" | "writing" | "speaking";
  duration: number; // in minutes
  total_questions: number;
  total_points: number;
  instructions: string;
  questions: QuizQuestion[];
}

// Mock Data cho IELTS Listening Test
export const ieltsListeningQuiz: QuizData = {
  id: "ielts-listening-1",
  title: "IELTS Listening Practice Test 1",
  description: "Complete listening test with 4 sections covering various topics",
  section: "listening",
  duration: 30,
  total_questions: 40,
  total_points: 40,
  instructions: "You will hear a number of different recordings and you will have to answer questions on what you hear. There will be time for you to read the instructions and questions and you will have a chance to check your work. All recordings will be played once only.",
  questions: [
    // Section 1: Social/Everyday Context (Questions 1-10)
    {
      id: "q1",
      type: "fill_in_blank",
      question: "Complete the form below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.\n\nCustomer Satisfaction Survey\n\nWhere ticket was bought: (1) ___________",
      audio_url: "/audio/listening/section1.mp3",
      correct_answer: "online",
      explanation: "The speaker clearly states they bought their ticket online.",
      points: 1,
      time_limit: 60,
      part: "Section 1",
      section: "listening"
    },
    {
      id: "q2",
      type: "fill_in_blank",
      question: "Satisfaction with journey: Most satisfied with: the (2) ___________",
      audio_url: "/audio/listening/section1.mp3",
      correct_answer: "wifi",
      explanation: "The passenger mentions being most satisfied with the wifi service.",
      points: 1,
      time_limit: 60,
      part: "Section 1",
      section: "listening"
    },
    {
      id: "q3",
      type: "fill_in_blank",
      question: "Least satisfied with: the (3) ___________ this morning",
      audio_url: "/audio/listening/section1.mp3",
      correct_answer: "delay",
      explanation: "The speaker expresses dissatisfaction with the delay this morning.",
      points: 1,
      time_limit: 60,
      part: "Section 1",
      section: "listening"
    },
    {
      id: "q4",
      type: "fill_in_blank",
      question: "Satisfaction with station facilities: Most satisfied with: how much (4) ___________ information was provided",
      audio_url: "/audio/listening/section1.mp3",
      correct_answer: "modern",
      explanation: "The speaker appreciates the modern information systems.",
      points: 1,
      time_limit: 60,
      part: "Section 1",
      section: "listening"
    },
    {
      id: "q5",
      type: "fill_in_blank",
      question: "Least satisfied with: lack of seats, particularly on the (5) ___________",
      audio_url: "/audio/listening/section1.mp3",
      correct_answer: "platform",
      explanation: "The complaint is specifically about seating on the platform.",
      points: 1,
      time_limit: 60,
      part: "Section 1",
      section: "listening"
    },
    {
      id: "q6",
      type: "fill_in_blank",
      question: "Neither satisfied nor dissatisfied with: the (6) ___________ available",
      audio_url: "/audio/listening/section1.mp3",
      correct_answer: "parking",
      explanation: "The speaker has neutral feelings about the parking facilities.",
      points: 1,
      time_limit: 60,
      part: "Section 1",
      section: "listening"
    },

    // Section 2: Social Context (Questions 11-20)
    {
      id: "q11",
      type: "multiple_choice",
      question: "What is the main purpose of the Riverside Festival?",
      audio_url: "/audio/listening/section2.mp3",
      options: [
        "A) To celebrate local history",
        "B) To raise money for charity",
        "C) To promote local businesses",
        "D) To bring the community together"
      ],
      correct_answer: "D",
      explanation: "The speaker emphasizes that the festival's main goal is community engagement.",
      points: 1,
      time_limit: 90,
      part: "Section 2",
      section: "listening"
    },
    {
      id: "q12",
      type: "multiple_choice",
      question: "The festival will take place:",
      audio_url: "/audio/listening/section2.mp3",
      options: [
        "A) Every weekend in July",
        "B) On the first Saturday of July",
        "C) Throughout the month of July",
        "D) On the last weekend of July"
      ],
      correct_answer: "B",
      explanation: "The date is specifically mentioned as the first Saturday of July.",
      points: 1,
      time_limit: 90,
      part: "Section 2",
      section: "listening"
    },

    // Section 3: Educational Context (Questions 21-30)
    {
      id: "q21",
      type: "multiple_choice",
      question: "What does Sarah think about the research methodology?",
      audio_url: "/audio/listening/section3.mp3",
      options: [
        "A) It needs to be completely changed",
        "B) It's appropriate for the study",
        "C) It's too complicated",
        "D) It requires more participants"
      ],
      correct_answer: "B",
      explanation: "Sarah expresses satisfaction with the current methodology approach.",
      points: 1,
      time_limit: 120,
      part: "Section 3",
      section: "listening"
    },
    {
      id: "q22",
      type: "fill_in_blank",
      question: "The students need to submit their (22) ___________ by next Friday.",
      audio_url: "/audio/listening/section3.mp3",
      correct_answer: "proposal",
      explanation: "The deadline mentioned is specifically for the research proposal.",
      points: 1,
      time_limit: 120,
      part: "Section 3",
      section: "listening"
    },

    // Section 4: Academic Context (Questions 31-40)
    {
      id: "q31",
      type: "fill_in_blank",
      question: "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.\n\nClimate Change and Agriculture\n\nThe main factor affecting crop yields is (31) ___________.",
      audio_url: "/audio/listening/section4.mp3",
      correct_answer: "temperature rise",
      explanation: "The lecture identifies temperature rise as the primary factor.",
      points: 1,
      time_limit: 150,
      part: "Section 4",
      section: "listening"
    },
    {
      id: "q32",
      type: "fill_in_blank",
      question: "Farmers in developing countries are particularly vulnerable due to (32) ___________ resources.",
      audio_url: "/audio/listening/section4.mp3",
      correct_answer: "limited",
      explanation: "The speaker emphasizes the resource constraints in developing nations.",
      points: 1,
      time_limit: 150,
      part: "Section 4",
      section: "listening"
    }
  ]
};

// Mock Data cho IELTS Reading Test
export const ieltsReadingQuiz: QuizData = {
  id: "ielts-reading-1",
  title: "IELTS Reading Practice Test 1",
  description: "Academic reading test with 3 passages and 40 questions",
  section: "reading",
  duration: 60,
  total_questions: 40,
  total_points: 40,
  instructions: "Read the following passages and answer the questions. You have 60 minutes to complete all three passages.",
  questions: [
    // Passage 1: Questions 1-13
    {
      id: "r1",
      type: "true_false",
      question: "Passage 1: The History of Chocolate\n\nRead the passage and answer the questions below.\n\n[Passage text would be here...]\n\nQuestion 1: Chocolate was first discovered in Europe.",
      correct_answer: "FALSE",
      explanation: "The passage clearly states that chocolate originated in Central America, not Europe.",
      points: 1,
      part: "Passage 1",
      section: "reading"
    },
    {
      id: "r2",
      type: "multiple_choice",
      question: "According to the passage, the Aztecs used chocolate primarily for:",
      options: [
        "A) Religious ceremonies",
        "B) Trading purposes",
        "C) Daily nutrition",
        "D) Medical treatment"
      ],
      correct_answer: "A",
      explanation: "The text mentions that chocolate had significant religious importance for the Aztecs.",
      points: 1,
      part: "Passage 1",
      section: "reading"
    },
    {
      id: "r3",
      type: "fill_in_blank",
      question: "Complete the sentence: European colonists modified the original chocolate recipe by adding ___________.",
      correct_answer: "sugar",
      explanation: "The passage indicates that sugar was the key European addition to chocolate.",
      points: 1,
      part: "Passage 1",
      section: "reading"
    },

    // Passage 2: Questions 14-26
    {
      id: "r14",
      type: "matching",
      question: "Passage 2: Renewable Energy Sources\n\nMatch each energy source with its main advantage:\n\nA) Solar power\nB) Wind power\nC) Hydroelectric power\nD) Geothermal power\n\n14. Consistent energy output regardless of weather",
      options: ["A", "B", "C", "D"],
      correct_answer: "D",
      explanation: "Geothermal energy provides consistent output as it's not weather-dependent.",
      points: 1,
      part: "Passage 2",
      section: "reading"
    },
    {
      id: "r15",
      type: "matching",
      question: "15. Most cost-effective in areas with high wind speeds",
      options: ["A", "B", "C", "D"],
      correct_answer: "B",
      explanation: "Wind power is most economical in windy regions.",
      points: 1,
      part: "Passage 2",
      section: "reading"
    },

    // Passage 3: Questions 27-40
    {
      id: "r27",
      type: "multiple_choice",
      question: "Passage 3: The Impact of Artificial Intelligence\n\nWhat is the author's main concern about AI development?",
      options: [
        "A) The speed of technological advancement",
        "B) The lack of government regulation",
        "C) The potential for job displacement",
        "D) The cost of implementation"
      ],
      correct_answer: "C",
      explanation: "The passage focuses primarily on employment concerns related to AI.",
      points: 1,
      part: "Passage 3",
      section: "reading"
    }
  ]
};

// Mock Data cho IELTS Writing Test
export const ieltsWritingQuiz: QuizData = {
  id: "ielts-writing-1",
  title: "IELTS Writing Practice Test 1",
  description: "Academic writing test with 2 tasks",
  section: "writing",
  duration: 60,
  total_questions: 2,
  total_points: 100,
  instructions: "You have 60 minutes to complete both writing tasks. Spend about 20 minutes on Task 1 and 40 minutes on Task 2.",
  questions: [
    {
      id: "w1",
      type: "fill_in_blank",
      question: "Writing Task 1\n\nThe chart below shows the percentage of households in different income brackets in Country X from 2000 to 2020.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.\n\n[Chart image would be displayed here]",
      image_url: "/images/writing/task1-chart.png",
      correct_answer: "Sample answer focusing on trends, comparisons, and key features of the data",
      explanation: "A good answer should describe the main trends, make relevant comparisons, and be well-organized with appropriate vocabulary.",
      points: 33,
      time_limit: 1200, // 20 minutes
      part: "Task 1",
      section: "writing"
    },
    {
      id: "w2",
      type: "fill_in_blank",
      question: "Writing Task 2\n\nSome people believe that social media platforms should be regulated by governments to prevent the spread of misinformation. Others argue that this would limit freedom of expression.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words.",
      correct_answer: "Sample essay with clear introduction, body paragraphs discussing both views, and conclusion with personal opinion",
      explanation: "A strong essay should present both viewpoints clearly, provide relevant examples, and maintain a clear position throughout.",
      points: 67,
      time_limit: 2400, // 40 minutes
      part: "Task 2",
      section: "writing"
    }
  ]
};

// Mock Data cho IELTS Speaking Test
export const ieltsSpeakingQuiz: QuizData = {
  id: "ielts-speaking-1",
  title: "IELTS Speaking Practice Test 1",
  description: "Speaking test simulation with 3 parts",
  section: "speaking",
  duration: 15,
  total_questions: 12,
  total_points: 100,
  instructions: "This speaking test consists of three parts and takes 11-14 minutes. You will be assessed on fluency, vocabulary, grammar, and pronunciation.",
  questions: [
    // Part 1: Introduction and Interview (4-5 minutes)
    {
      id: "s1",
      type: "fill_in_blank",
      question: "Part 1: Introduction and Interview\n\nLet's talk about your hometown.\n\nQuestion: Where do you come from?",
      correct_answer: "I come from [city name], which is located in [region/country]. It's a [description] place known for [notable features].",
      explanation: "Provide a clear, direct answer with some additional detail about your hometown.",
      points: 8,
      time_limit: 60,
      part: "Part 1",
      section: "speaking"
    },
    {
      id: "s2",
      type: "fill_in_blank",
      question: "What do you like most about your hometown?",
      correct_answer: "What I like most about my hometown is [specific aspect]. For example, [give example/explanation].",
      explanation: "Give a specific reason and support it with an example or explanation.",
      points: 8,
      time_limit: 60,
      part: "Part 1",
      section: "speaking"
    },
    {
      id: "s3",
      type: "fill_in_blank",
      question: "How has your hometown changed in recent years?",
      correct_answer: "My hometown has changed quite a bit recently. The most noticeable change is [describe change] which has [impact/result].",
      explanation: "Describe specific changes and their effects on the community.",
      points: 8,
      time_limit: 60,
      part: "Part 1",
      section: "speaking"
    },

    // Part 2: Long Turn (3-4 minutes)
    {
      id: "s4",
      type: "fill_in_blank",
      question: "Part 2: Long Turn\n\nDescribe a memorable journey you have taken.\n\nYou should say:\n- where you went\n- how you traveled\n- who you went with\n- and explain why this journey was memorable for you\n\nYou have one minute to prepare and should speak for 1-2 minutes.",
      correct_answer: "Well, I'd like to talk about a really memorable journey I took to [destination] last [time period]...",
      explanation: "Structure your answer to cover all points on the cue card with specific details and personal experiences.",
      points: 25,
      time_limit: 180, // 3 minutes including preparation
      part: "Part 2",
      section: "speaking"
    },

    // Part 3: Discussion (4-5 minutes)
    {
      id: "s5",
      type: "fill_in_blank",
      question: "Part 3: Discussion\n\nLet's discuss travel and tourism.\n\nWhat are the benefits of traveling to different countries?",
      correct_answer: "There are several significant benefits to international travel. Firstly, [benefit 1 with explanation]. Additionally, [benefit 2 with example]...",
      explanation: "Provide multiple benefits with explanations and examples. Use advanced vocabulary and complex sentence structures.",
      points: 17,
      time_limit: 120,
      part: "Part 3",
      section: "speaking"
    },
    {
      id: "s6",
      type: "fill_in_blank",
      question: "How do you think tourism affects local communities?",
      correct_answer: "Tourism can have both positive and negative effects on local communities. On the positive side, [positive effects]. However, there can also be drawbacks such as [negative effects]...",
      explanation: "Present a balanced view with both positive and negative aspects, supporting your points with examples.",
      points: 17,
      time_limit: 120,
      part: "Part 3",
      section: "speaking"
    },
    {
      id: "s7",
      type: "fill_in_blank",
      question: "Do you think virtual reality could replace real travel in the future?",
      correct_answer: "That's an interesting question. While virtual reality technology is advancing rapidly, I don't think it could completely replace real travel because [reasons]...",
      explanation: "Give a thoughtful opinion with reasoning. Consider future possibilities while acknowledging current limitations.",
      points: 17,
      time_limit: 120,
      part: "Part 3",
      section: "speaking"
    }
  ]
};

// Combined export for all quiz types
export const allIeltsQuizzes = {
  listening: ieltsListeningQuiz,
  reading: ieltsReadingQuiz,
  writing: ieltsWritingQuiz,
  speaking: ieltsSpeakingQuiz
};

// Helper functions for quiz management
export const getQuizBySection = (section: "listening" | "reading" | "writing" | "speaking"): QuizData => {
  return allIeltsQuizzes[section];
};

export const getRandomQuizQuestion = (section: "listening" | "reading" | "writing" | "speaking"): QuizQuestion => {
  const quiz = getQuizBySection(section);
  const randomIndex = Math.floor(Math.random() * quiz.questions.length);
  return quiz.questions[randomIndex];
};

export const calculateQuizScore = (answers: { [questionId: string]: string }, quiz: QuizData): number => {
  let correctAnswers = 0;
  
  quiz.questions.forEach(question => {
    const userAnswer = answers[question.id];
    if (userAnswer && userAnswer.toLowerCase().trim() === question.correct_answer.toString().toLowerCase().trim()) {
      correctAnswers++;
    }
  });
  
  return Math.round((correctAnswers / quiz.total_questions) * 100);
};

// Band score conversion (IELTS specific)
export const convertToBandScore = (percentage: number, section: string): number => {
  if (section === "listening" || section === "reading") {
    if (percentage >= 97) return 9.0;
    if (percentage >= 89) return 8.5;
    if (percentage >= 82) return 8.0;
    if (percentage >= 75) return 7.5;
    if (percentage >= 68) return 7.0;
    if (percentage >= 60) return 6.5;
    if (percentage >= 52) return 6.0;
    if (percentage >= 45) return 5.5;
    if (percentage >= 37) return 5.0;
    if (percentage >= 30) return 4.5;
    if (percentage >= 22) return 4.0;
    if (percentage >= 15) return 3.5;
    if (percentage >= 8) return 3.0;
    return 2.5;
  }
  
  // For writing and speaking, scoring is more subjective
  // This is a simplified conversion
  if (percentage >= 90) return 9.0;
  if (percentage >= 80) return 8.0;
  if (percentage >= 70) return 7.0;
  if (percentage >= 60) return 6.0;
  if (percentage >= 50) return 5.0;
  if (percentage >= 40) return 4.0;
  if (percentage >= 30) return 3.0;
  return 2.0;
};

export default allIeltsQuizzes;