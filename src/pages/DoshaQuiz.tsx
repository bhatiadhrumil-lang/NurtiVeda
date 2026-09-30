import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Leaf, Sparkles } from "lucide-react";
import { doshaQuestions, doshaDetails } from "@/components/DoshaQuizData";
import type { DoshaInfo } from "@/components/DoshaQuizData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DoshaResult from "@/components/DoshaResult";

const DoshaQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [scores, setScores] = useState({ vata: 0, pitta: 0, kapha: 0 });
  const [result, setResult] = useState<{ primary: DoshaInfo; secondary: DoshaInfo | null; scores: typeof scores } | null>(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = ((currentQuestion + 1) / doshaQuestions.length) * 100;
  const question = doshaQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === doshaQuestions.length - 1;

  const handleAnswer = (dosha: "vata" | "pitta" | "kapha") => {
    setAnswers((prev) => ({ ...prev, [question.id]: dosha }));

    const newScores = { ...scores };
    // Remove previous answer score if re-answering
    const prevAnswer = answers[question.id];
    if (prevAnswer) {
      newScores[prevAnswer as keyof typeof scores]--;
    }
    newScores[dosha]++;
    setScores(newScores);

    if (!isLastQuestion) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 300);
    }
  };

  const calculateResult = async () => {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const primaryDosha = sorted[0][0];
    const secondaryDosha = sorted[1][1] > 0 ? sorted[1][0] : null;

    const resultData = {
      primary: doshaDetails[primaryDosha],
      secondary: secondaryDosha ? doshaDetails[secondaryDosha] : null,
      scores,
    };
    setResult(resultData);

    if (user) {
      setSaving(true);
      const { error } = await supabase.from("dosha_results").insert({
        user_id: user.id,
        vata_score: scores.vata,
        pitta_score: scores.pitta,
        kapha_score: scores.kapha,
        primary_dosha: primaryDosha,
        secondary_dosha: secondaryDosha,
        answers: answers as unknown as never,
      });

      if (error) {
        toast({ title: "Could not save results", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Results saved!", description: "Your dosha profile has been stored." });
      }
      setSaving(false);
    }
  };


  if (result) {
    return <DoshaResult result={result} onRetake={() => {
      setCurrentQuestion(0);
      setAnswers({});
      setScores({ vata: 0, pitta: 0, kapha: 0 });
      setResult(null);
    }} />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Discover Your Dosha</h1>
            <p className="text-sm text-muted-foreground">Answer {doshaQuestions.length} questions to find your Ayurvedic body type</p>
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestion + 1} of {doshaQuestions.length}</span>
            <span>{question.category}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card border-border/50">
            <CardContent className="pt-8 pb-8">
              <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-8 text-center">
                {question.question}
              </h2>

              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.dosha;
                  return (
                    <button
                      key={option.dosha}
                      onClick={() => handleAnswer(option.dosha)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-soft"
                          : "border-border/50 bg-card hover:border-primary/30 hover:bg-accent/50"
                      }`}
                    >
                      <p className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {option.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>

            {isLastQuestion && answers[question.id] ? (
              <Button variant="hero" onClick={calculateResult} disabled={saving}>
                <Sparkles className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "See My Dosha"}
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => setCurrentQuestion((prev) => Math.min(doshaQuestions.length - 1, prev + 1))}
                disabled={!answers[question.id]}
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoshaQuiz;
