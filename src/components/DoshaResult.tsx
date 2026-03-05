import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Home, Check, X, Utensils, Heart, Wind } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DoshaInfo } from "@/components/DoshaQuizData";

interface DoshaResultProps {
  result: {
    primary: DoshaInfo;
    secondary: DoshaInfo | null;
    scores: { vata: number; pitta: number; kapha: number };
  };
  onRetake: () => void;
}

const DoshaResult = ({ result, onRetake }: DoshaResultProps) => {
  const navigate = useNavigate();
  const { primary, secondary, scores } = result;
  const total = scores.vata + scores.pitta + scores.kapha;

  const doshaBarData = [
    { name: "Vata", score: scores.vata, color: "bg-purple-500", textColor: "text-purple-600" },
    { name: "Pitta", score: scores.pitta, color: "bg-terracotta", textColor: "text-terracotta" },
    { name: "Kapha", score: scores.kapha, color: "bg-sage", textColor: "text-sage" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 py-8 relative max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-2xl font-bold text-foreground">Your Dosha Profile</h1>
        </div>

        {/* Primary Dosha Hero */}
        <Card className={`shadow-elevated border-border/50 mb-6 bg-gradient-to-br ${primary.gradient}`}>
          <CardContent className="pt-8 pb-8 text-center">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Your Primary Dosha</Badge>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">{primary.name}</h2>
            <p className="text-lg text-muted-foreground mb-4">{primary.element}</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {primary.qualities.map((q) => (
                <Badge key={q} variant="outline" className="text-sm">{q}</Badge>
              ))}
            </div>
            <p className="text-foreground/80 max-w-lg mx-auto leading-relaxed">{primary.description}</p>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card className="shadow-card border-border/50 mb-6">
          <CardContent className="pt-6 pb-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Your Dosha Balance</h3>
            <div className="space-y-3">
              {doshaBarData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className={`text-sm font-medium w-14 ${d.textColor}`}>{d.name}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${d.color} rounded-full transition-all duration-700`}
                      style={{ width: `${(d.score / total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{Math.round((d.score / total) * 100)}%</span>
                </div>
              ))}
            </div>
            {secondary && (
              <p className="text-sm text-muted-foreground mt-4">
                Your secondary dosha is <span className="font-semibold text-foreground">{secondary.name}</span> ({secondary.element})
              </p>
            )}
          </CardContent>
        </Card>

        {/* Strengths & Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-soft border-border/50">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Your Strengths</h3>
              </div>
              <ul className="space-y-2">
                {primary.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-border/50">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <Wind className="w-5 h-5 text-secondary" />
                <h3 className="font-serif text-lg font-semibold text-foreground">Watch Out For</h3>
              </div>
              <ul className="space-y-2">
                {primary.challenges.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-foreground/80">
                    <X className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Diet Recommendations */}
        <Card className="shadow-card border-border/50 mb-6">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-lg font-semibold text-foreground">Diet Recommendations</h3>
            </div>
            <div className="space-y-2 mb-6">
              {primary.dietTips.map((tip) => (
                <p key={tip} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {tip}
                </p>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2 text-sm">✅ Best Foods</h4>
                <div className="flex flex-wrap gap-1.5">
                  {primary.bestFoods.map((f) => (
                    <Badge key={f} variant="outline" className="text-xs bg-background/60">{f}</Badge>
                  ))}
                </div>
              </div>
              <div className="bg-destructive/5 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2 text-sm">❌ Foods to Avoid</h4>
                <div className="flex flex-wrap gap-1.5">
                  {primary.avoidFoods.map((f) => (
                    <Badge key={f} variant="outline" className="text-xs bg-background/60">{f}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle */}
        <Card className="shadow-soft border-border/50 mb-8">
          <CardContent className="pt-6 pb-6">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-4">🧘 Lifestyle Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {primary.lifestyle.map((tip) => (
                <p key={tip} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 flex-shrink-0" />
                  {tip}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={onRetake}>
            <RefreshCw className="w-4 h-4 mr-2" /> Retake Quiz
          </Button>
          <Button variant="hero" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoshaResult;
