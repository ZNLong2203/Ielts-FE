"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const IntroductionSection = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.5,
      },
    }),
  }

  return (
    <div className="px-4 md:px-8 lg:px-12 xl:px-32 pb-20">
      <div className="relative flex justify-center rounded-t-[32px] lg:rounded-t-[48px] -mt-10 md:-mt-[47px] 2xl:-mt-[92px]">
        <div className="max-w-screen-xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col text-center justify-center"
          >
            <div className="text-center block">
              <h2 className="relative">
                <div className="text-[26px] font-bold leading-[120%] md:text-[32px] 2xl:text-[40px] 2xl:leading-[50px] tracking-tight bg-gradient-to-r from-blue-900 to-blue-500 bg-clip-text text-transparent">
                  Master all skills with a high-quality training program tailored to your goals.
                </div>
              </h2>
            </div>
            <div className="mt-3 flex text-center justify-center">
              <div className="text-center text-lg tracking-tight md:leading-7 md:tracking-[0.2px] text-gray-600 max-w-3xl">
                Learning a foreign language is easy with a comprehensive, personalized Study & Test Preparation plan
              </div>
            </div>
          </motion.div>

          <div className="grid max-sm:grid-cols-1 lg:grid-cols-4 grid-cols-2 mt-[60px] gap-4 3xl:gap-8">
            <motion.a
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              href=""
              className="block h-full transform transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl p-6 hover:shadow-[0px_36px_50px_-22px_rgba(5,6,15,0.50)] lg:min-h-[284px] lg:p-6 2xl:min-h-[382px] 2xl:rounded-[44px] 2xl:p-8 bg-[radial-gradient(218.93%_138.81%_at_100%_98.77%,#0029FF_0%,#1479F3_50%,#47B7F7_100%)]">
                <div className="relative">
                  <h3 className="text-xl font-bold leading-[120%] text-white md:text-xl lg:text-2xl lg:leading-[44px] xl:text-3xl 2xl:text-4xl">
                    Listening
                  </h3>
                  <div className="mt-2 font-normal text-white lg:text-sm xl:text-md 2xl:text-lg">
                    Enhance your listening skills with expert feedback. Improve your comprehension and response time
                    with every lesson!
                  </div>
                </div>
                <div className="relative flex justify-end max-sm:pt-10 max-lg:pt-10 2xl:pt-10">
                  <div className="flex size-[52px] max-lg:size-[40px] 2xl:size-[60px] items-center justify-center rounded-full border border-white bg-transparent text-white hover:bg-white/10 transition-all duration-300">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </motion.a>

            <motion.a
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              href=""
              className="block h-full transform transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl p-6 hover:shadow-[0px_36px_50px_-22px_rgba(5,6,15,0.50)] lg:min-h-[284px] lg:p-6 2xl:min-h-[382px] 2xl:rounded-[44px] 2xl:p-8 bg-[radial-gradient(99.48%_132.1%_at_2.5%_100%,#002EA6_0%,#0047FF_100%)]">
                <div className="relative">
                  <h3 className="text-xl font-bold leading-[120%] text-white md:text-xl lg:text-2xl lg:leading-[44px] xl:text-3xl 2xl:text-4xl">
                    Reading
                  </h3>
                  <div className="mt-2 font-normal text-white lg:text-sm xl:text-md 2xl:text-lg">
                    Follow a learning path for speaking with ease and fluency. Practice your speaking skills and watch
                    your progress unfold with every conversation!
                  </div>
                </div>
                <div className="relative flex justify-end max-sm:pt-10 max-lg:pt-10 2xl:pt-10">
                  <div className="flex size-[52px] max-lg:size-[40px] 2xl:size-[60px] items-center justify-center rounded-full border border-white bg-transparent text-white hover:bg-white/10 transition-all duration-300">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </motion.a>

            <motion.a
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              href=""
              className="block h-full transform transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl p-6 hover:shadow-[0px_36px_50px_-22px_rgba(5,6,15,0.50)] lg:min-h-[284px] lg:p-6 2xl:min-h-[382px] 2xl:rounded-[44px] 2xl:p-8 bg-[linear-gradient(46deg,#007E26_0%,#00D741_100%)]">
                <div className="relative">
                  <h3 className="text-xl font-bold leading-[120%] text-white md:text-xl lg:text-2xl lg:leading-[44px] xl:text-3xl 2xl:text-4xl">
                    Writing
                  </h3>
                  <div className="mt-2 font-normal text-white lg:text-sm xl:text-md 2xl:text-lg">
                    Build a solid foundation from the basics. Practice writing with AI and see noticeable progress with
                    each lesson.
                  </div>
                </div>
                <div className="relative flex justify-end max-sm:pt-10 max-lg:pt-10 2xl:pt-10">
                  <div className="flex size-[52px] max-lg:size-[40px] 2xl:size-[60px] items-center justify-center rounded-full border border-white bg-transparent text-white hover:bg-white/10 transition-all duration-300">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </motion.a>

            <motion.a
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              href=""
              className="block h-full transform transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl p-6 hover:shadow-[0px_36px_50px_-22px_rgba(5,6,15,0.50)] lg:min-h-[284px] lg:p-6 2xl:min-h-[382px] 2xl:rounded-[44px] 2xl:p-8 bg-[linear-gradient(219deg,#FFD324_4.72%,#FF9F00_95.59%)]">
                <div className="relative">
                  <h3 className="text-xl font-bold leading-[120%] text-white md:text-xl lg:text-2xl lg:leading-[44px] xl:text-3xl 2xl:text-4xl">
                    Speaking
                  </h3>
                  <div className="mt-2 font-normal text-white lg:text-sm xl:text-md 2xl:text-lg">
                    Communicate flexibly with a set of highly practical topics, continuously practice and receive
                    corrections in various scenarios.
                  </div>
                </div>
                <div className="relative flex justify-end max-sm:pt-10 max-lg:pt-10 2xl:pt-10">
                  <div className="flex size-[52px] max-lg:size-[40px] 2xl:size-[60px] items-center justify-center rounded-full border border-white bg-transparent text-white hover:bg-white/10 transition-all duration-300">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntroductionSection
