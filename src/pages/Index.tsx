import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import DietsSection from "@/components/DietsSection";
import AyurvedaSection from "@/components/AyurvedaSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DietsSection />
        <AyurvedaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
