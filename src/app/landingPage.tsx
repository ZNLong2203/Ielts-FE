import GoogleAuthHandler from "@/components/auth/GoogleAuthHandler";
import Footer from "@/components/footer";
import CourseSection from "@/components/landing/course";
import HeroSection from "@/components/landing/hero";
import IntroductionSection from "@/components/landing/introduction";
import Sponser from "@/components/landing/sponsor";
import { Testimonials } from "@/components/landing/testimonials";
import LandingNavbar from "@/components/navbar";
// import Prize from "@/components/landing/prize";

const LandingPage = () => {
  return (
    <div className="relative">
      <GoogleAuthHandler />
      <div className="absolute left-0 right-0 top-0 z-[-1] h-14 bg-[linear-gradient(180deg,#011657_0%,#022571_100%)] md:h-[68px] 2xl:h-20"></div>
      <div>
        <div className="hidden w-full md:block"></div>
        <div className="w-full md:hidden"></div>
      </div>
      <LandingNavbar />
      <HeroSection />
      <IntroductionSection />
      <CourseSection />
      <Testimonials />
      <Sponser />
      {/* <Prize/> */}
      <Footer />
    </div>
  );
};

export default LandingPage;
