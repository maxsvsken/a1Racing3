import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import DirectorSection from "@/components/DirectorSection";
import InvestorsSection from "@/components/InvestorsSection";
import ExpertiseSection from "@/components/ExpertiseSection";
import CodeSection from "@/components/CodeSection";
import AudienceSection from "@/components/AudienceSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col w-full relative z-10 bg-deep-black overflow-hidden">
        {/* Aerodynamic background elements */}
        <div className="absolute left-[-200px] top-[15vh] w-[400px] h-[400px] bg-racing-red/2 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute right-[-200px] top-[45vh] w-[500px] h-[500px] bg-white/2 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute left-[-200px] top-[75vh] w-[450px] h-[450px] bg-racing-red/2 rounded-full blur-[150px] pointer-events-none" />

        {/* Sections */}
        <HeroSection />
        <AboutSection />
        <DirectorSection />
        <InvestorsSection />
        <ExpertiseSection />
        <CodeSection />
        <AudienceSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
