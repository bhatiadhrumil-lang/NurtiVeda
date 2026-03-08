import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CompleteProfile from "./pages/CompleteProfile";
import Profile from "./pages/Profile";
import DoshaQuiz from "./pages/DoshaQuiz";
import MealLog from "./pages/MealLog";
import MealPlans from "./pages/MealPlans";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dosha-quiz" element={<DoshaQuiz />} />
            <Route path="/meal-log" element={<MealLog />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
