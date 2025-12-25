"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Phone, MessageCircle } from "lucide-react";
import LandingNavbar from "@/components/navbar";
import Footer from "@/components/footer";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "About IELTS",
    question: "What is IELTS and why do I need to take it?",
    answer:
      "IELTS (International English Language Testing System) is an internationally recognized English proficiency test widely accepted worldwide. IELTS certification is required when you want to study abroad, immigrate, or work in English-speaking countries such as the UK, Australia, Canada, New Zealand, and many other countries.",
  },
  {
    category: "About IELTS",
    question: "What are the sections of the IELTS test?",
    answer:
      "The IELTS test consists of 4 skills: Listening - 30 minutes, Reading - 60 minutes, Writing - 60 minutes, and Speaking - 11-14 minutes. The total test time is approximately 2 hours and 45 minutes.",
  },
  {
    category: "About IELTS",
    question: "What's the difference between IELTS Academic and IELTS General Training?",
    answer:
      "IELTS Academic is for those who want to study abroad or register to work in an academic environment. IELTS General Training is for those who want to immigrate, work, or pursue vocational training abroad. The Listening and Speaking sections are the same, but Reading and Writing have different content.",
  },
  {
    category: "About IELTS",
    question: "How is the IELTS scoring calculated?",
    answer:
      "IELTS is scored on a scale from 0-9, with each band being 0.5 points apart. The Overall Band Score is the average of the 4 skills: Listening, Reading, Writing, and Speaking. For example: if you get L7.0, R6.5, W6.0, S7.0, your Overall is 6.5.",
  },
  {
    category: "Test Preparation",
    question: "How much time do I need to prepare for the IELTS test?",
    answer:
      "Preparation time depends on your current level and target score. On average, students need 3-6 months of regular study to improve by 0.5-1.0 band score. With a well-structured course and diligent practice, you can achieve your goal faster.",
  },
  {
    category: "Test Preparation",
    question: "How can I improve my IELTS Speaking score?",
    answer:
      "To improve Speaking, you need to: (1) Practice speaking regularly, at least 30 minutes/day, (2) Expand topic-based vocabulary, (3) Practice Part 1, 2, 3 question types, (4) Record and self-evaluate, (5) Find a partner or teacher to practice with. Confidence and naturalness are also very important!",
  },
  {
    category: "Test Preparation",
    question: "What are the best materials to study for IELTS?",
    answer:
      "Recommended materials: Cambridge IELTS 1-18 (real tests), Barron's books, Collins, Mind the Gap. Additionally, websites like IELTS Liz and IELTS Simon are very helpful. The key is to practice with real tests and regularly analyze your mistakes.",
  },
  {
    category: "Our Courses",
    question: "What makes your courses special?",
    answer:
      "Our courses are systematically designed with a clear roadmap from basic to advanced. You will learn with experienced instructors, updated materials, rich practice exercises, and 1-1 support to improve your weaknesses. In addition, we have a mock test system that simulates the real test to help you get familiar with the test format.",
  },
  {
    category: "Our Courses",
    question: "Can I try before enrolling?",
    answer:
      "Yes, we provide free demo lessons for you to experience the quality of the course. You can also refer to reviews from students who have taken the course to make an appropriate decision. Contact us to receive a free trial link!",
  },
  {
    category: "Our Courses",
    question: "What experience do the instructors have?",
    answer:
      "Our team of instructors all have IELTS 8.0+ certificates and many years of teaching experience. They have trained thousands of students to achieve their target scores, understand the psychology of Vietnamese learners, and know how to solve common difficulties.",
  },
  {
    category: "Registration & Payment",
    question: "How do I enroll in a course?",
    answer:
      "You can enroll in a course directly on the website by selecting the appropriate course, adding it to your cart, and making payment. After successful payment, you will receive a confirmation email and can immediately access the learning materials.",
  },
  {
    category: "Registration & Payment",
    question: "What payment methods are accepted?",
    answer:
      "We accept payment via: (1) Domestic ATM cards, (2) International credit cards Visa/Mastercard, (3) E-wallets (MoMo, ZaloPay, VNPay), (4) Bank transfer. All transactions are securely encrypted.",
  },
  {
    category: "Registration & Payment",
    question: "How long can I access the course?",
    answer:
      "After enrollment, you can access the course materials for the duration specified on each course (usually 6-12 months). You can study anytime, anywhere at your own pace. With VIP courses, you have lifetime access.",
  },
  {
    category: "Registration & Payment",
    question: "Is there a refund policy?",
    answer:
      "Yes, we have a 100% refund policy within the first 7 days if you haven't completed more than 20% of the course content and are not satisfied with the quality. After this period, you can switch to another course of equal or higher value.",
  },
  {
    category: "Student Support",
    question: "Will I get support during the learning process?",
    answer:
      "Yes, we have a 24/7 student support team via email, chat, and hotline. You can also ask questions directly to the instructor in the comment section of each lesson. For premium courses, you get 1-1 support with instructors.",
  },
  {
    category: "Student Support",
    question: "Will I receive a certificate after completing the course?",
    answer:
      "Yes, after completing the course and meeting the requirements, you will receive a course completion certificate from us. This certificate can be used to prove your learning process, however please note that this is not an official IELTS certificate from IDP or British Council.",
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(faqData.map(faq => faq.category)))];

  const filteredFAQ = selectedCategory === "All" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <div className="absolute left-0 right-0 top-0 z-[-1] h-14 bg-[linear-gradient(180deg,#011657_0%,#022571_100%)] md:h-[68px] 2xl:h-20"></div>
      <LandingNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#011657] via-[#022571] to-[#033899] py-16 mt-[100px] text-white md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="mb-8 text-lg text-blue-100 md:text-xl">
              Find answers to common questions about IELTS and our courses
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
                <MessageCircle className="h-5 w-5" />
                <span>16+ Questions</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
                <Phone className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setOpenIndex(null);
                }}
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-[#011657] text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="mx-auto max-w-4xl">
            <div className="space-y-4">
              {filteredFAQ.map((faq, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-start justify-between gap-4 p-6 text-left transition-colors hover:bg-gray-50"
                    aria-expanded={openIndex === index}
                  >
                    <div className="flex-1">
                      <span className="mb-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#011657]">
                        {faq.category}
                      </span>
                      <h3 className="text-base font-semibold text-gray-900 md:text-lg">
                        {faq.question}
                      </h3>
                    </div>
                    <span className="flex-shrink-0 text-[#011657]">
                      {openIndex === index ? (
                        <ChevronUp className="h-6 w-6" />
                      ) : (
                        <ChevronDown className="h-6 w-6" />
                      )}
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
                      <p className="leading-relaxed text-gray-700">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FAQPage;
