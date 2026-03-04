import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Search, Sparkles, Upload, Loader2 } from "lucide-react";
import { useNutritionLookup } from "@/hooks/useNutritionLookup";
import NutritionResult from "@/components/NutritionResult";
import PhotoAnalysisResult, { type PhotoAnalysisData } from "@/components/PhotoAnalysisResult";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<PhotoAnalysisData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isLoading, nutritionData, lookupNutrition, clearNutritionData } = useNutritionLookup();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    lookupNutrition(searchQuery);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file (PNG, JPG).", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 10MB.", variant: "destructive" });
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("analyze-food-image", {
        body: { imageBase64: base64 },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.success && data.data) {
        setAnalysisData(data.data);
        toast({ title: "Photo analyzed!", description: "Food items identified successfully." });
      }
    } catch (error) {
      console.error("Error analyzing photo:", error);
      toast({
        title: "Failed to analyze photo",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setPreviewUrl("");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearAnalysis = () => {
    setAnalysisData(null);
    setPreviewUrl("");
  };

  return (
    <section id="home" className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-sage-light rounded-full blur-3xl opacity-60 animate-blob" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-terracotta-light rounded-full blur-3xl opacity-40 animate-blob" style={{ animationDelay: "-4s" }} />

      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/60 backdrop-blur-sm border border-border/50 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI-Powered Nutrition Analysis</span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in-up text-balance leading-tight" style={{ animationDelay: "0.1s" }}>
            Discover the <span className="text-primary">Nutrition</span> in Every Bite
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Upload a photo of your meal or search for any food. Get instant nutrition insights powered by AI and ancient Ayurvedic wisdom.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for any food... (e.g., apple, chicken, rice)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 text-base shadow-card"
                />
              </div>
              <Button type="submit" variant="hero" size="xl" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </form>

          {/* Photo Upload Area */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            className={`max-w-2xl mx-auto animate-fade-in-up ${isDragging ? "scale-105" : ""}`}
            style={{ animationDelay: "0.4s" }}
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
          >
            <div
              className={`relative p-8 md:p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-card/50 backdrop-blur-sm"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-medium mb-1">Analyzing your food photo...</p>
                    <p className="text-sm text-muted-foreground">AI is identifying food items and calculating nutrition</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground font-medium mb-1">Drop your food photo here</p>
                    <p className="text-sm text-muted-foreground">or click to upload • PNG, JPG up to 10MB</p>
                  </div>
                  <Button variant="outline" size="lg" className="mt-2" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            {[
              { value: "10K+", label: "Foods" },
              { value: "99%", label: "Accuracy" },
              { value: "50+", label: "Nutrients" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-serif font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {nutritionData && <NutritionResult data={nutritionData} onClose={clearNutritionData} />}
      {analysisData && previewUrl && <PhotoAnalysisResult data={analysisData} imageUrl={previewUrl} onClose={clearAnalysis} />}
    </section>
  );
};

export default HeroSection;
