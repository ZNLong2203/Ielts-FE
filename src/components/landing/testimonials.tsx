"use client";
import avatar1 from "../../../public/images/avatar-1.png";
import avatar2 from "../../../public/images/avatar-2.png";
import avatar3 from "../../../public/images/avatar-3.png";
import avatar4 from "../../../public/images/avatar-4.png";
import avatar5 from "../../../public/images/avatar-5.png";
import avatar6 from "../../../public/images/avatar-6.png";
import avatar7 from "../../../public/images/avatar-7.png";
import avatar8 from "../../../public/images/avatar-8.png";
import avatar9 from "../../../public/images/avatar-9.png";

import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import React from "react";
import { StarIcon } from "lucide-react";

const testimonials = [
  {
    text: "I enrolled in the IELTS course here, and the quality of the lessons is truly outstanding! The preparation was easy, and my English has improved significantly.",
    imageSrc: avatar1.src,
    rating: 5,
    likes: 120,
    name: "Jamie Rivera",
    username: "@jamietechguru00",
  },
  {
    text: "The customer support for the IELTS course is fantastic! I had a question about the syllabus, and they helped me resolve it quickly and efficiently.",
    imageSrc: avatar2.src,
    rating: 4.5,
    likes: 95,
    name: "Josh Smith",
    username: "@jjsmith",
  },
  {
    text: "The prices for the IELTS preparation courses are very competitive compared to other providers. I saved a lot of money by choosing this program.",
    imageSrc: avatar3.src,
    rating: 4,
    likes: 150,
    name: "Morgan Lee",
    username: "@morganleewhiz",
  },
  {
    text: "The detailed information about the IELTS exam sections and strategies is very helpful, making it easy for me to focus on the areas I need to improve.",
    imageSrc: avatar4.src,
    rating: 5,
    likes: 200,
    name: "Casey Jordan",
    username: "@caseyj",
  },
  {
    text: "The course platform is very user-friendly, and I could easily access all the study materials I needed with just a few clicks. Truly convenient!",
    imageSrc: avatar5.src,
    rating: 5,
    likes: 180,
    name: "Taylor Kim",
    username: "@taylorkimm",
  },
  {
    text: "The feedback on my practice tests was incredibly fast! I received it just a few hours after submission. I am very impressed with the service.",
    imageSrc: avatar6.src,
    rating: 4.5,
    likes: 110,
    name: "Riley Smith",
    username: "@rileysmith1",
  },
  {
    text: "I am very satisfied with my IELTS preparation experience here! From the course registration to the final mock tests, everything went smoothly.",
    imageSrc: avatar7.src,
    rating: 5,
    likes: 130,
    name: "Jordan Patels",
    username: "@jpatelsdesign",
  },
  {
    text: "I needed technical support for accessing some course materials, and the support team was very helpful. Truly commendable!",
    imageSrc: avatar8.src,
    rating: 4.5,
    likes: 90,
    name: "Sam Dawson",
    username: "@dawsontechtips",
  },
  {
    text: "I feel reassured knowing that the course offers a money-back guarantee if it does not meet my expectations. That gives me peace of mind.",
    imageSrc: avatar9.src,
    rating: 5,
    likes: 160,
    name: "Casey Harper",
    username: "@casey09",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center gap-0.5">
      {/* Filled stars */}
      {Array.from({ length: fullStars }, (_, i) => (
        <StarIcon key={`full-${i}`} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <StarIcon className="h-4 w-4 text-gray-300 fill-gray-300" />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {Array.from({ length: emptyStars }, (_, i) => (
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300 fill-gray-300" />
      ))}
      
      <span className="ml-1 text-xs text-gray-600">({rating})</span>
    </div>
  );
};

const TestimonialsColumn = (props: {
  className?: string;
  testimonial: typeof testimonials;
  duration?: number;
}) => (
  <div className={props.className}>
    <motion.div
      className="flex flex-col gap-4 sm:gap-6 pb-6"
      animate={{
        translateY: "-50%",
      }}
      transition={{
        duration: props.duration || 10,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
    >
      {[
        ...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonial.map(({ name, imageSrc, text, username, rating, likes }) => (
              <div
                key={name}
                className={twMerge(
                  "p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-[#F1F1F1] shadow-[0_7px_14px_#EAEAEA] max-w-sm w-full",
                  props.className
                )}
              >
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <Image
                    alt="avatar"
                    src={imageSrc}
                    width={40}
                    height={40}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                  />
                  <div className="flex flex-col text-black">
                    <div className="font-semibold tracking-tight leading-5 text-sm sm:text-base">
                      {name}
                    </div>
                    <div className="tracking-tight leading-5 text-xs sm:text-sm text-gray-600">
                      {username}
                    </div>
                  </div>
                </div>
                <div className="text-black text-sm sm:text-base">{text}</div>
                
                {/* Rating and Likes Section */}
                <div className="mt-4 flex items-center justify-between text-xs sm:text-sm text-gray-600">
                  <StarRating rating={rating} />
                  <div className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>{likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        )),
      ]}
    </motion.div>
  </div>
);

export const Testimonials = () => {
  return (
    <section
      className="bg-white py-12 sm:py-16 md:py-20 lg:py-24 px-4"
      id="about"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center font-bold tracking-tight bg-gradient-to-r from-blue-900 to-blue-500 text-transparent bg-clip-text mt-5 leading-tight">
          Highly praised by hundreds of thousands of students
          <br className="hidden sm:block" />
          who have enrolled and are currently studying.
        </h2>
        <p className="text-center text-sm sm:text-base md:text-lg leading-relaxed tracking-tight text-[#010D3E] mt-4 sm:mt-5 max-w-[600px] mx-auto px-4">
          This is the greatest recognition for Prep, motivating Prep to
          continuously improve and deliver the best learning experience for you
        </p>
        <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[500px] sm:max-h-[600px] md:max-h-[700px] lg:max-h-[738px] overflow-hidden">
          <TestimonialsColumn testimonial={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonial={secondColumn}
            duration={19}
            className="hidden sm:block"
          />
          <TestimonialsColumn
            testimonial={thirdColumn}
            duration={17}
            className="hidden lg:block"
          />
        </div>
      </div>
    </section>
  );
};