"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Mousewheel } from "swiper/modules";
import { Trophy, Medal, Award, Star, TrendingUp } from "lucide-react";

// Import styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/mousewheel";

// Import images
import prize1 from "../../../public/icons/pr1.png";
import prize2 from "../../../public/icons/pr2.png";
import prize3 from "../../../public/icons/pr3.png";
import prize4 from "../../../public/icons/pr4.png";
import prize5 from "../../../public/icons/pr5.png";

// Award data with enhanced metadata
const PrizeData = [
  {
    id: 1,
    src: prize1,
    title: "Education Impact Award",
    description:
      "Education Impact Award of the Year – Education Innovation Award of the Year",
    year: "2023",
    icon: Trophy,
    gradient: "from-blue-600 to-blue-400",
  },
  {
    id: 2,
    src: prize2,
    title: "Most Innovative AI",
    description: "Most Innovative AI in Education – Edtech Asia",
    year: "2023",
    icon: Star,
    gradient: "from-violet-600 to-violet-400",
  },
  {
    id: 3,
    src: prize3,
    title: "Top 50 EdTech Companies",
    description: "Top 50 Most Promising EdTech Companies in Southeast Asia",
    year: "2024",
    icon: Award,
    gradient: "from-indigo-600 to-indigo-400",
  },
  {
    id: 4,
    src: prize5,
    title: "Nextgen Tech 30",
    description:
      "A leading growth company in Southeast Asia through digital transformation",
    year: "2022",
    icon: TrendingUp,
    gradient: "from-cyan-600 to-cyan-400",
  },
  {
    id: 5,
    src: prize4,
    title: "GESAwards Winner",
    description: "GESAwards Southeast Asia Winner – GESAwards",
    year: "2021",
    icon: Medal,
    gradient: "from-amber-600 to-amber-400",
  },
];

const PrizeCard = ({ prize }: { prize: (typeof PrizeData)[0] }) => {
  const Icon = prize.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full p-6 hover:shadow-md transition-all duration-300 group">
        {/* Award header with icon and year */}
        <div className="flex justify-between items-center mb-4">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-r ${prize.gradient} flex items-center justify-center`}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>

          <div className="text-xs font-medium text-gray-500">{prize.year}</div>
        </div>

        {/* Award image */}
        <div className="flex justify-center mb-5">
          <Image
            src={prize.src}
            width={100}
            height={100}
            alt="Description"
            className="w-auto h-auto"
          />
        </div>

        {/* Award title and description */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 text-center group-hover:text-blue-600 transition-colors">
          {prize.title}
        </h3>

        <p className="text-center text-gray-500 text-sm">{prize.description}</p>
      </div>
    </motion.div>
  );
};

const Prize = () => {
  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-blue-50/40 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-blue-400/10 text-blue-600 px-4 py-1 rounded-full text-sm font-medium mb-4">
            Award-Winning Platform
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r text-blue-800 bg-clip-text mb-6">
            Our Achievements
          </h2>

          <p className="max-w-2xl mx-auto text-gray-600 text-lg">
            We're proud to be recognized for our innovation and impact in the
            education sector, helping students achieve their language learning
            goals
          </p>
        </motion.div>

        {/* Stats banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { value: "15+", label: "Awards & Recognition" },
            { value: "2019", label: "Founded" },
            { value: "5+", label: "Years of Excellence" },
            { value: "20K+", label: "Student Success Stories" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100 shadow-sm"
            >
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Swiper carousel with navigation and improved styling */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay, Mousewheel]}
          spaceBetween={24}
          slidesPerView="auto"
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          loop={true}
          grabCursor={true}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="py-8 [--swiper-pagination-color:theme(colors.blue.500)] [--swiper-navigation-color:theme(colors.blue.600)] [--swiper-navigation-size:18px] [--swiper-pagination-bullet-size:10px] [--swiper-pagination-bullet-inactive-color:theme(colors.blue.200)]"
        >
          {PrizeData.map((prize) => (
            <SwiperSlide key={prize.id} className="h-auto py-4">
              <PrizeCard prize={prize} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Experience our award-winning IELTS courses
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of successful students who have achieved their target
            IELTS scores with our proven methodology
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            Start Your Journey Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Prize;
