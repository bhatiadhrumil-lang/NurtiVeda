import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMealPlans } from "@/hooks/useMealPlans";
import MealPlanCard from "@/components/MealPlanCard";
import ActiveMealPlanView from "@/components/ActiveMealPlanView";
import MealReminders from "@/components/MealReminders";
import { toast } from "sonner";

const MealPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    plans, activePlan, reminders, isLoading,
    selectPlan, deactivatePlan,
    addReminder, toggleReminder, deleteReminder,
  } = useMealPlans();

  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState("male");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("weight,height,gender").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        if (data.weight) setWeight(Number(data.weight));
        if (data.height) setHeight(Number(data.height));
        if (data.gender) setGender(data.gender);
      }
    });
  }, [user]);

  const handleSelect = (planId: string) => {
    if (!user) {
      toast.error("Please sign in to select a meal plan");
      return;
    }
    selectPlan(planId, weight, height, gender);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {activePlan ? (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-serif font-bold text-foreground">Your Active Meal Plan</h1>
              <p className="text-muted-foreground mt-1">Personalized based on your body metrics</p>
            </div>
            <ActiveMealPlanView userPlan={activePlan} onDeactivate={deactivatePlan} />
            <MealReminders
              reminders={reminders}
              onAdd={addReminder}
              onToggle={toggleReminder}
              onDelete={deleteReminder}
            />
            <Card className="border-border/50">
              <CardContent className="py-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Want to switch plans?</p>
                <Button variant="outline" onClick={deactivatePlan}>Browse Other Plans</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Choose Your Meal Plan</h1>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                Select a plan that matches your diet preference and fitness goals. We'll personalize the calorie and macro targets based on your profile.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <MealPlanCard
                  key={plan.id}
                  plan={plan}
                  isSelected={false}
                  onSelect={() => handleSelect(plan.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MealPlans;
