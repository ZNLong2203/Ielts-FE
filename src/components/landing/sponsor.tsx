"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Handshake, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import logo images
import idp from "../../../public/icons/idp.png";
import british from "../../../public/icons/british.png";
import ipp from "../../../public/icons/ipp.png";
import ielts from "../../../public/icons/ielts.png";
import toeic from "../../../public/icons/toeic.png";
import toefl from "../../../public/icons/toefl.png"
import sat from "../../../public/icons/sat.png";
import iig from "../../../public/icons/iig.png";
import aptis from "../../../public/icons/aptis.png";
import zim from "../../../public/icons/zim.png";
import fighter from "../../../public/icons/fighter.png";
import imap from "../../../public/icons/imap.png";
import workshop from "../../../public/icons/workshop.png";
import cam from '../../../public/icons/cam.png';

const Sponsor = () => {
  // Partner logos configuration with categories
  const sponsors = [
    { 
      name: "British Council", 
      src: british, 
      className: "h-12 w-auto",
      category: "Exam Provider" 
    },
    { 
      name: "IDP Education", 
      src: idp, 
      className: "h-12 w-auto",
      category: "Exam Provider" 
    },
    { 
      name: "IPP Education", 
      src: ipp, 
      className: "h-10 w-auto",
      category: "Training Partner" 
    },
    { 
      name: "IELTS", 
      src: ielts, 
      className: "h-20 w-auto",
      category: "Certification" 
    },
    { 
      name: "TOEIC", 
      src: toeic, 
      className: "h-12 w-auto",
      category: "Certification" 
    },
    { 
      name: "TOEFL", 
      src: toefl, 
      className: "h-8 w-auto",
      category: "Certification" 
    },
    { 
      name: "SAT", 
      src: sat, 
      className: "h-14 w-auto",
      category: "Certification" 
    },
    { 
      name: "Aptis", 
      src: aptis, 
      className: "h-12 w-auto",
      category: "Certification" 
    },
    { 
      name: "IIG Vietnam", 
      src: iig, 
      className: "h-16 w-auto",
      category: "Education Partner" 
    },
    { 
      name: "ZIM Academy", 
      src: zim, 
      className: "h-18 w-auto",
      category: "Education Partner" 
    },
    { 
      name: "Fighter Group", 
      src: fighter, 
      className: "h-16 w-auto",
      category: "Corporate Partner" 
    },
    { 
      name: "IMAP", 
      src: imap, 
      className: "h-16 w-auto",
      category: "Education Partner" 
    },
    { 
      name: "Workshop", 
      src: workshop, 
      className: "h-20 w-auto",
      category: "Corporate Partner" 
    },
    { 
      name: "Cambridge English", 
      src: cam, 
      className: "h-24 w-auto",
      category: "Exam Provider" 
    },
  ];

  // Duplicate sponsors for continuous animation
  const duplicatedSponsors = [...sponsors, ...sponsors, ...sponsors];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Benefits of partnership
  const benefits = [
    "Access to premium IELTS preparation materials",
    "Co-branded educational events and webinars",
    "Priority placement for your students in our courses",
    "Exclusive discounts for your organization"
  ];

  return (
    <section className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-white to-blue-50/40 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* Section heading */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-7xl mx-auto"
        >
          <div className="inline-block bg-blue-400/10 text-blue-600 px-4 py-1 rounded-full text-sm font-medium mb-4">
            Trusted Globally
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r text-blue-800 bg-clip-text mb-6">
            Our Partners & Collaborations
          </h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-lg text-gray-600"
          >
            We are proud to be supported by leading educational institutions and
            organizations committed to quality education. Their collaboration strengthens our mission to
            provide the best learning experience for your success.
          </motion.p>
        </motion.div>
      
        {/* Logos marquee with gradient overlays */}
        <div className="relative overflow-hidden bg-white/50 py-10 rounded-2xl">
          {/* Left gradient fade */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 z-10 bg-gradient-to-r from-white to-transparent"></div>
          
          {/* Right gradient fade */}
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 z-10 bg-gradient-to-l from-white to-transparent"></div>
          
          {/* Scrolling logos container */}
          <motion.div
            className="flex items-center gap-10 md:gap-16 lg:gap-20 py-4 px-4"
            initial={{ x: 0 }}
            animate={{ x: "-33.33%" }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            }}
          >
            {duplicatedSponsors.map((sponsor, index) => (
              <motion.div
                key={`${sponsor.name}-${index}`}
                className="flex flex-col items-center justify-center flex-shrink-0 group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="bg-white rounded-xl p-6 shadow-sm group-hover:shadow-md transition-all duration-300 flex items-center justify-center border border-gray-100">
                  <Image
                    src={sponsor.src}
                    alt={sponsor.name}
                    className={sponsor.className}
                    title={sponsor.name}
                  />
                </div>
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                    {sponsor.category}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Partnership benefits section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16 max-w-7xl mx-auto"
        >
          <motion.div variants={itemVariants} className="flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6">
              Why Partner With Us?
            </h3>
            
            <p className="text-gray-600 mb-8">
              Join our network of educational partners and help your students achieve their language learning goals. 
              Our partnership program offers numerous benefits and resources to support your institution.
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-blue-500 p-1 rounded-full mr-3 mt-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl p-8 shadow-md border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 p-2 rounded-full mr-3">
                <Handshake className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900">Become a Partner</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Interested in exploring partnership opportunities? Fill out our simple form and our partnership team will get back to you within 48 hours.
            </p>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center">
                Submit Partnership Request
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </motion.div>
        </motion.div>
        
        {/* Testimonial banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-white shadow-lg max-w-7xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-4">
                "The partnership with this IELTS preparation platform has significantly elevated the quality of our language training programs."
              </h3>
              <p className="font-medium">
                Dr. Rebecca Chen, Academic Director at Cambridge Language Institute
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center md:justify-end">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-medium">
                Read Success Stories
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Sponsor;