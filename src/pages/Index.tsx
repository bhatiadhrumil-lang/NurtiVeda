import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import DietsSection from "@/components/DietsSection";
import AyurvedaSection from "@/components/AyurvedaSection";
import Footer from "@/components/Footer";
import TodayDashboard from "@/components/TodayDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useMealLogs } from "@/hooks/useMealLogs";
import { useMealPlans } from "@/hooks/useMealPlans";

const Index = () => {
  const { user } = useAuth();
  const { logs } = useMealLogs();
  const { activePlan } = useMealPlans();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <div id="analyze" className="scroll-mt-20">
          <HeroSection />
        </div>
        {user && logs.length > 0 && (
          <TodayDashboard logs={logs} calorieTarget={activePlan?.daily_calorie_target} />
        )}
        <FeaturesSection />
        <div id="diets" className="scroll-mt-20">
          <DietsSection />
        </div>
        <div id="ayurveda" className="scroll-mt-20">
          <AyurvedaSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
