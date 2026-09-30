import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMealPlans } from "@/hooks/useMealPlans";
import { calculateAge, getActivityLevel, setActivityLevel, ACTIVITY_OPTIONS } from "@/lib/health";
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

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState<number | null>(null);
  const [activity, setActivity] = useState(() => getActivityLevel());

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("weight,height,gender,date_of_birth").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        if (data.weight) setWeight(String(data.weight));
        if (data.height) setHeight(String(data.height));
        if (data.gender) setGender(data.gender);
        setAge(calculateAge((data as { date_of_birth?: string }).date_of_birth));
      }
    });
  }, [user]);

  const handleActivity = (v: string) => {
    setActivity(v);
    setActivityLevel(v);
  };

  const handleSelect = (planId: string) => {
    if (!user) {
      toast.error("Please sign in to select a meal plan");
      return;
    }
    const w = Number(weight);
    const h = Number(height);
    if (!w || !h) {
      toast.error("Enter your weight and height to personalize calories");
      return;
    }
    selectPlan(planId, w, h, gender, age, activity);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-2/3 mx-auto" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
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
              <p className="text-muted-foreground mt-1">Personalized based on your body metrics{age ? `, age ${age}` : ""}</p>
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
                Select a plan that matches your diet preference and fitness goals. We&apos;ll personalize the calorie and macro targets using Mifflin-St Jeor with your real age and activity level.
              </p>
            </div>
            <Card className="border-border/50 mb-6">
              <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="mp-weight">Weight (kg)</Label>
                  <Input id="mp-weight" type="number" min={20} max={300} placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mp-height">Height (cm)</Label>
                  <Input id="mp-height" type="number" min={50} max={300} placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Activity</Label>
                  <Select value={activity} onValueChange={handleActivity}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
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
