import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Beef, Wheat, Droplets, Plus, ArrowRight, CalendarCheck } from "lucide-react";
import type { MealLog } from "@/hooks/useMealLogs";
import { dayKey, calcStreak } from "@/lib/health";

interface TodayDashboardProps {
  logs: MealLog[];
  calorieTarget?: number | null;
}

const TodayDashboard = ({ logs, calorieTarget }: TodayDashboardProps) => {
  const today = dayKey(new Date());
  const todayLogs = logs.filter((l) => dayKey(l.logged_at) === today);
  const cal = todayLogs.reduce((s, l) => s + l.calories, 0);
  const protein = todayLogs.reduce((s, l) => s + l.protein, 0);
  const carbs = todayLogs.reduce((s, l) => s + l.carbs, 0);
  const fat = todayLogs.reduce((s, l) => s + l.fat, 0);
  const streak = calcStreak(Array.from(new Set(logs.map((l) => dayKey(l.logged_at)))));
  const pct = calorieTarget ? Math.min(100, Math.round((cal / calorieTarget) * 100)) : null;

  return (
    <section aria-label="Today's progress" className="container mx-auto px-4 -mt-4 mb-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-primary" /> Today · {todayLogs.length} meal(s)
                {streak > 1 && <span className="text-xs px-2 py-0.5 rounded-full bg-golden/20 text-golden">🔥 {streak}-day streak</span>}
              </p>
              <Link to="/meal-log">
                <Button size="sm" variant="outline"><Plus className="w-3.5 h-3.5 mr-1" /> Log</Button>
              </Link>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-foreground">{cal}</span>
              <span className="text-sm text-muted-foreground mb-1">/ {calorieTarget ?? 2000} kcal</span>
              {pct !== null && <span className="text-xs text-muted-foreground mb-1 ml-auto">{pct}%</span>}
            </div>
            <Progress value={pct ?? Math.min(100, (cal / 2000) * 100)} className="h-2.5" />
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              {[
                { icon: Beef, label: "Protein", value: `${protein}g` },
                { icon: Wheat, label: "Carbs", value: `${carbs}g` },
                { icon: Droplets, label: "Fat", value: `${fat}g` },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-background border border-border/50 p-2">
                  <m.icon className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="text-sm font-bold">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-5 flex flex-col gap-2">
            <p className="text-sm font-medium flex items-center gap-2"><Flame className="w-4 h-4 text-destructive" /> Quick actions</p>
            <Link to="/meal-plans"><Button variant="hero" size="sm" className="w-full">My meal plan <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button></Link>
            <Link to="/dosha-quiz"><Button variant="outline" size="sm" className="w-full">Retake Dosha quiz</Button></Link>
            <Link to="/profile"><Button variant="ghost" size="sm" className="w-full">Profile & history</Button></Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TodayDashboard;
