import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import type { MealLog } from "@/hooks/useMealLogs";

interface NutritionProgressChartProps {
  logs: MealLog[];
}

const COLORS = [
  "hsl(150, 35%, 35%)",
  "hsl(25, 45%, 65%)",
  "hsl(40, 70%, 55%)",
  "hsl(150, 25%, 45%)",
];

const NutritionProgressChart = ({ logs }: NutritionProgressChartProps) => {
  // Last 7 days bar chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i));
    const dayLogs = logs.filter(
      (l) => startOfDay(new Date(l.logged_at)).getTime() === date.getTime()
    );
    return {
      date: format(date, "EEE"),
      calories: dayLogs.reduce((s, l) => s + l.calories, 0),
      protein: dayLogs.reduce((s, l) => s + l.protein, 0),
      carbs: dayLogs.reduce((s, l) => s + l.carbs, 0),
      fat: dayLogs.reduce((s, l) => s + l.fat, 0),
    };
  });

  // Totals for pie chart
  const totalProtein = logs.reduce((s, l) => s + l.protein, 0);
  const totalCarbs = logs.reduce((s, l) => s + l.carbs, 0);
  const totalFat = logs.reduce((s, l) => s + l.fat, 0);
  const pieData = [
    { name: "Protein", value: totalProtein },
    { name: "Carbs", value: totalCarbs },
    { name: "Fat", value: totalFat },
  ].filter((d) => d.value > 0);

  // Summary stats
  const totalCalories = logs.reduce((s, l) => s + l.calories, 0);
  const avgCalories = logs.length > 0 ? Math.round(totalCalories / Math.max(1, new Set(logs.map(l => format(new Date(l.logged_at), "yyyy-MM-dd"))).size)) : 0;

  if (logs.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Meals", value: logs.length, color: "text-primary" },
          { label: "Total Calories", value: totalCalories.toLocaleString(), color: "text-destructive" },
          { label: "Avg Cal/Day", value: avgCalories.toLocaleString(), color: "text-secondary" },
          { label: "Total Protein", value: `${totalProtein}g`, color: "text-primary" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-lg">Calories – Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 85%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="calories" fill="hsl(150, 35%, 35%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {pieData.length > 0 && (
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-lg">Macro Split</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NutritionProgressChart;
