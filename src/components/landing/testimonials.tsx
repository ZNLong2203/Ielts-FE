"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Quote, Star, StarHalf, StarIcon } from "lucide-react";

// Import avatar images
import avatar1 from "../../../public/images/avatar-1.png";
import avatar2 from "../../../public/images/avatar-2.png";
import avatar3 from "../../../public/images/avatar-3.png";
import avatar4 from "../../../public/images/avatar-4.png";
import avatar5 from "../../../public/images/avatar-5.png";
import avatar6 from "../../../public/images/avatar-6.png";
import avatar7 from "../../../public/images/avatar-7.png";
import avatar8 from "../../../public/images/avatar-8.png";
import avatar9 from "../../../public/images/avatar-9.png";

// Testimonial data
const testimonials = [
  {
    text: "I enrolled in the IELTS course here, and the quality of the lessons is truly outstanding! The preparation was easy, and my English has improved significantly.",
    imageSrc: avatar1.src,
    rating: 5,
    likes: 120,
    name: "Jamie Rivera",
    username: "@jamietechguru00",
    tag: "Listening Course"
  },
  {
    text: "The customer support for the IELTS course is fantastic! I had a question about the syllabus, and they helped me resolve it quickly and efficiently.",
    imageSrc: avatar2.src,
    rating: 4.5,
    likes: 95,
    name: "Josh Smith",
    username: "@jjsmith",
    tag: "Speaking Course"
  },
  {
    text: "The prices for the IELTS preparation courses are very competitive compared to other providers. I saved a lot of money by choosing this program.",
    imageSrc: avatar3.src,
    rating: 4,
    likes: 150,
    name: "Morgan Lee",
    username: "@morganleewhiz",
    tag: "Writing Course"
  },
  {
    text: "The detailed information about the IELTS exam sections and strategies is very helpful, making it easy for me to focus on the areas I need to improve.",
    imageSrc: avatar4.src,
    rating: 5,
    likes: 200,
    name: "Casey Jordan",
    username: "@caseyj",
    tag: "Reading Course"
  },
  {
    text: "The course platform is very user-friendly, and I could easily access all the study materials I needed with just a few clicks. Truly convenient!",
    imageSrc: avatar5.src,
    rating: 5,
    likes: 180,
    name: "Taylor Kim",
    username: "@taylorkimm",
    tag: "Complete Course"
  },
  {
    text: "The feedback on my practice tests was incredibly fast! I received it just a few hours after submission. I am very impressed with the service.",
    imageSrc: avatar6.src,
    rating: 4.5,
    likes: 110,
    name: "Riley Smith",
    username: "@rileysmith1",
    tag: "Test Preparation"
  },
  {
    text: "I am very satisfied with my IELTS preparation experience here! From the course registration to the final mock tests, everything went smoothly.",
    imageSrc: avatar7.src,
    rating: 5,
    likes: 130,
    name: "Jordan Patels",
    username: "@jpatelsdesign",
    tag: "Band 7+ Course"
  },
  {
    text: "I needed technical support for accessing some course materials, and the support team was very helpful. Truly commendable!",
    imageSrc: avatar8.src,
    rating: 4.5,
    likes: 90,
    name: "Sam Dawson",
    username: "@dawsontechtips",
    tag: "Support"
  },
  {
    text: "I feel reassured knowing that the course offers a money-back guarantee if it does not meet my expectations. That gives me peace of mind.",
    imageSrc: avatar9.src,
    rating: 5,
    likes: 160,
    name: "Casey Harper",
    username: "@casey09",
    tag: "Guarantee"
  },
];

// Split testimonials into columns
const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

// Star rating component with improved visual design
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center">
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <Star key={`star-full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" strokeWidth={1.5} />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-4 w-4 text-gray-200 fill-gray-200" strokeWidth={1.5} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" strokeWidth={1.5} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star key={`star-empty-${i}`} className="h-4 w-4 text-gray-200 fill-gray-200" strokeWidth={1.5} />
        ))}
      </div>
      
      <span className="ml-1.5 text-xs font-medium text-gray-500">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// Testimonial card column with continuous animation
const TestimonialsColumn = ({
  testimonials,
  duration = 25,
  className = "",
  delay = 0
}: {
  testimonials: typeof firstColumn;
  duration?: number;
  className?: string;
  delay?: number;
}) => {
  return (
    <div className={`w-72 sm:w-80 md:w-96 ${className}`}>
      <motion.div
        className="flex flex-col gap-5 sm:gap-6 md:gap-8"
        initial={{ y: delay }}
        animate={{ y: "-50%" }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: duration,
          ease: "linear",
        }}
      >
        {/* Duplicate testimonials to create seamless loop */}
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <motion.div
            key={`${testimonial.name}-${index}`}
            className="bg-white rounded-2xl p-6 shadow-[0_5px_30px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow duration-300"
            whileHover={{ y: -5 }}
          >
            {/* Quote icon */}
            <div className="mb-4 text-blue-100">
              <Quote className="h-6 w-6 text-blue-500/30 rotate-180" />
            </div>
            
            {/* Testimonial text */}
            <p className="text-gray-700 text-sm sm:text-base mb-5 leading-relaxed">
              "{testimonial.text}"
            </p>
            
            {/* Divider */}
            <div className="h-px w-full bg-gray-100 my-5"></div>
            
            {/* User info and rating */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src={testimonial.imageSrc}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-white shadow-sm"
                  />
                  <div className="absolute -right-1 -bottom-1 bg-blue-500 rounded-full w-3.5 h-3.5 border border-white flex items-center justify-center">
                    <span className="text-[8px] text-white">✓</span>
                  </div>
                </div>
                
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">{testimonial.username}</div>
                    <div className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {testimonial.tag}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Likes counter */}
              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                <Heart className="h-3.5 w-3.5 text-red-400 fill-red-400" />
                <span className="text-xs font-medium text-gray-500">{testimonial.likes}</span>
              </div>
            </div>
            
            {/* Rating */}
            <div className="mt-4">
              <StarRating rating={testimonial.rating} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Main testimonials component
export const Testimonials = () => {
  // Animation variants for the section heading
  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section heading */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={headerVariants}
          className="text-center mb-16"
        >
          <div className="inline-block bg-blue-400/10 text-blue-600 px-4 py-1 rounded-full text-sm font-medium mb-4">
            Student Testimonials
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r text-blue-800 bg-clip-text mb-6 px-4">
            Join thousands of satisfied students
          </h2>
          
          <p className="max-w-2xl mx-auto text-gray-600 text-lg">
            Our students have achieved remarkable success in their IELTS journey.
            Here's what they have to say about their experience with our courses.
          </p>
        </motion.div>
      
        {/* Stats banner */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16">
          {[
            { value: "98%", label: "Satisfaction Rate" },
            { value: "15K+", label: "Active Students" },
            { value: "4.8/5", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Testimonial columns with gradient overlay mask */}
        <div className="relative">
          {/* Top fade gradient */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-50 to-transparent z-10"></div>
          
          {/* Bottom fade gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent z-10"></div>
          
          {/* Testimonial columns container */}
          <div className="flex justify-center gap-5 md:gap-6 lg:gap-8 max-h-[600px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={35} delay={-200} />
            <TestimonialsColumn testimonials={secondColumn} duration={25} className="hidden md:block" />
            <TestimonialsColumn testimonials={thirdColumn} duration={30} delay={-400} className="hidden lg:block" />
          </div>
        </div>
        
        {/* CTA section */}
        <div className="mt-16 text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            Start Your IELTS Journey Today
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Join our community of successful IELTS test-takers
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;