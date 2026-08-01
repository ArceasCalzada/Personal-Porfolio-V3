import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ShowcaseTabs from "@/components/ShowcaseTabs";
import Footer from "@/components/Footer";
import Onboarding from "@/components/Onboarding";

export default function Home() {
  return (
    <>
      <Onboarding />
      <div className="glow-container">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        <div className="noise-overlay"></div>
        <div className="dots-overlay"></div>
      </div>

      <Navbar />
      
      <main className="content-wrapper">
        <Hero />
        <About />
        <ShowcaseTabs />
      </main>

      <Footer />
    </>
  );
}
