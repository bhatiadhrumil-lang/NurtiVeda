import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Leaf, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import MealLogForm from "@/components/MealLogForm";
import MealLogHistory from "@/components/MealLogHistory";
import NutritionProgressChart from "@/components/NutritionProgressChart";
import { useMealLogs, type MealLog as MealLogType } from "@/hooks/useMealLogs";

const MealLog = () => {
  const { user } = useAuth();
  const { logs, isLoading, addLog, updateLog, deleteLog } = useMealLogs();
  const [editing, setEditing] = useState<MealLogType | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" aria-label="Back to home">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-serif text-lg font-semibold">Meal Log</span>
            </div>
          </div>
          {!user && (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-1.5">
                <LogIn className="w-4 h-4" /> Sign in to sync
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {!user && (
          <div className="rounded-lg bg-accent/50 border border-border/50 px-4 py-3 text-sm text-muted-foreground">
            You&apos;re logging as a guest — meals are saved in your browser. <Link to="/auth" className="text-primary font-medium underline">Sign in</Link> to save across devices. Guest meals auto-sync on your first login.
          </div>
        )}

        <MealLogForm onSubmit={addLog} onUpdate={updateLog} editing={editing} onCancelEdit={() => setEditing(null)} />
        <NutritionProgressChart logs={logs} />

        <div>
          <h2 className="font-serif text-xl font-semibold mb-4">Meal History</h2>
          <MealLogHistory logs={logs} onDelete={deleteLog} onEdit={setEditing} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default MealLog;
