import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { setActivityLevel, ACTIVITY_OPTIONS } from "@/lib/health";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, profileCompleted } = useAuth();

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("light");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
    if (!loading && user && profileCompleted) navigate("/");
  }, [user, loading, profileCompleted, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      toast({ title: "Full name is required", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        profile_completed: true,
      })
      .eq("id", user.id);

    setIsSaving(false);

    if (error) {
      toast({ title: "Failed to save profile", description: error.message, variant: "destructive" });
    } else {
      setActivityLevel(activity);
      toast({ title: "Profile saved!", description: "Welcome to NutriVeda." });
      navigate("/");
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ profile_completed: true }).eq("id", user.id);
    navigate("/");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <span className="font-serif text-2xl font-semibold text-foreground">NutriVeda</span>
        </div>

        <Card className="border-border/50 shadow-elevated">
          <CardHeader>
            <CardTitle className="text-xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Help us personalize your nutrition journey by providing a few details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name *</Label>
                <Input
                  id="full-name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    placeholder="e.g. 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    min="50"
                    max="300"
                    placeholder="e.g. 170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Activity level</Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={handleSkip}>
                  Skip for now
                </Button>
                <Button type="submit" variant="hero" className="flex-1" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;
