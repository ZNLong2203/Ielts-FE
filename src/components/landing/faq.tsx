"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is IELTS and why do I need to take it?",
    answer:
      "IELTS (International English Language Testing System) is an internationally recognized English proficiency test widely accepted worldwide. IELTS certification is required when you want to study abroad, immigrate, or work in English-speaking countries such as the UK, Australia, Canada, New Zealand, and many other countries.",
  },
  {
    question: "What are the sections of the IELTS test?",
    answer:
      "The IELTS test consists of 4 skills: Listening - 30 minutes, Reading - 60 minutes, Writing - 60 minutes, and Speaking - 11-14 minutes. The total test time is approximately 2 hours and 45 minutes.",
  },
  {
    question: "What's the difference between IELTS Academic and IELTS General Training?",
    answer:
      "IELTS Academic is for those who want to study abroad or register to work in an academic environment. IELTS General Training is for those who want to immigrate, work, or pursue vocational training abroad. The Listening and Speaking sections are the same, but Reading and Writing have different content.",
  },
  {
    question: "How much time do I need to prepare for the IELTS test?",
    answer:
      "Preparation time depends on your current level and target score. On average, students need 3-6 months of regular study to improve by 0.5-1.0 band score. With a well-structured course and diligent practice, you can achieve your goal faster.",
  },
  {
    question: "What makes your courses special?",
    answer:
      "Our courses are systematically designed with a clear roadmap from basic to advanced. You will learn with experienced instructors, updated materials, rich practice exercises, and 1-1 support to improve your weaknesses. In addition, we have a mock test system that simulates the real test to help you get familiar with the test format.",
  },
  {
    question: "How do I enroll in a course?",
    answer:
      "You can enroll in a course directly on the website by selecting the appropriate course, adding it to your cart, and making payment. After successful payment, you will receive a confirmation email and can immediately access the learning materials.",
  },
  {
    question: "Can I try before enrolling?",
    answer:
      "Yes, we provide free demo lessons for you to experience the quality of the course. You can also refer to reviews from students who have taken the course to make an appropriate decision.",
  },
  {
    question: "How long can I access the course?",
    answer:
      "After enrollment, you can access the course materials for the duration specified on each course (usually 6-12 months). You can study anytime, anywhere at your own pace.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#011657] md:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
            Find answers to common questions about IELTS and our courses
          </p>
        </div>

        {/* FAQ Items */}
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-gray-50 md:p-6"
                  aria-expanded={openIndex === index}
                >
                  <span className="pr-4 text-base font-semibold text-gray-900 md:text-lg">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0 text-[#011657]">
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                      <ChevronDown className="h-5 w-5 md:h-6 md:w-6" />
                    )}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="border-t border-gray-100 bg-gray-50 p-5 md:p-6">
                    <p className="text-sm leading-relaxed text-gray-700 md:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-600">
            Have more questions? We're always here to help!
          </p>
          <button className="rounded-lg bg-[#011657] px-8 py-3 font-semibold text-white transition-all duration-300 hover:bg-[#022571] hover:shadow-lg">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
