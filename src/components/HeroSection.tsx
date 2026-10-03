import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Search, Sparkles, Upload, Loader2, Barcode, History } from "lucide-react";
import { useNutritionLookup } from "@/hooks/useNutritionLookup";
import { useMealLogs } from "@/hooks/useMealLogs";
import NutritionResult from "@/components/NutritionResult";
import PhotoAnalysisResult, { type PhotoAnalysisData } from "@/components/PhotoAnalysisResult";
import { useToast } from "@/hooks/use-toast";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { compressFoodImage } from "@/lib/image-compression";
import { dayKey, calcStreak } from "@/lib/health";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [showBarcode, setShowBarcode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<PhotoAnalysisData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Guards against double-processing: some browsers/environments can deliver
  // the same file twice (change + drop races, double dialogs), which used to
  // pop the result/toast twice. Only one analysis runs at a time and a file
  // that just succeeded within 3s is ignored. Nothing fails silently: the
  // busy path toasts, and stale locks self-release after 90s.
  const processingRef = useRef(false);
  const lastFileRef = useRef<{ name: string; size: number; lastModified: number; at: number; ok: boolean } | null>(null);
  const { toast } = useToast();
  const { isLoading, nutritionData, notFound, lastMatches, history, lookupNutrition, lookupByBarcode, clearNutritionData } = useNutritionLookup();
  const { logs } = useMealLogs();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    clearAnalysis();
    lookupNutrition(searchQuery);
  };

  const processFile = async (file: File) => {
    // Self-healing: if a previous run never finished (unmount/HMR race),
    // don't stay locked forever — release locks older than 90s.
    if (processingRef.current) {
      const startedAt = lastFileRef.current?.at ?? 0;
      if (Date.now() - startedAt < 90_000) {
        toast({ title: "Still analyzing", description: "Please wait for the current photo to finish." });
        return;
      }
      processingRef.current = false;
    }
    const now = Date.now();
    const last = lastFileRef.current;
    if (last && last.name === file.name && last.size === file.size &&
        last.lastModified === file.lastModified && now - last.at < 3000 && last.ok) {
      // Same file successfully processed moments ago (double event) — ignore.
      return;
    }
    processingRef.current = true;
    lastFileRef.current = { name: file.name, size: file.size, lastModified: file.lastModified, at: now, ok: false };
    clearNutritionData();
    if (!file.type.startsWith("image/")) {
      processingRef.current = false;
      toast({ title: "Invalid file", description: "Please upload an image file (PNG, JPG).", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      processingRef.current = false;
      toast({ title: "File too large", description: "Please upload an image under 10MB.", variant: "destructive" });
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsAnalyzing(true);

    try {
      const compressedImage = await compressFoodImage(file);
      const { data, error } = await supabase.functions.invoke("analyze-food-image", {
        body: { imageBase64: compressedImage.dataUrl, mimeType: compressedImage.mimeType },
      });

      if (error) {
        console.error("Photo analysis function error:", error);
        setPreviewUrl("");
        // Surface the server's real message when the function responded
        // (e.g. 503 missing key, 429 rate limit, 502 Gemini failure) instead
        // of always blaming deployment. Only network-level failures mean
        // the function isn't deployed/reachable.
        if (error instanceof FunctionsHttpError) {
          let serverMessage: string | null = null;
          try {
            const payload = await error.context.json();
            serverMessage = typeof payload?.error === "string" ? payload.error : null;
          } catch {
            /* ignore body parse errors */
          }
          toast({
            title: "Photo analysis failed",
            description: serverMessage ?? `Server responded with HTTP ${error.status}. Check function logs in Supabase.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Photo analysis not connected yet",
            description:
              "The image analysis service isn't deployed or unreachable. Deploy the analyze-food-image edge function.",
            variant: "destructive",
          });
        }
        return;
      }
      if (!data?.success || !data.data) throw new Error(data?.error ?? "No analysis received.");

      const analysisData = data.data as PhotoAnalysisData;

      setAnalysisData(analysisData);
      if (lastFileRef.current) lastFileRef.current.ok = true;
      toast({ title: "Photo analyzed!", description: "Food items identified successfully." });
    } catch (error) {
      console.error("Error analyzing photo:", error);
      toast({
        title: "Failed to analyze photo",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setPreviewUrl("");
    } finally {
      processingRef.current = false;
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("[NutriVeda] photo selected:", file ? `${file.name} (${file.type}, ${file.size} bytes)` : "none");
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearAnalysis = () => {
    setAnalysisData(null);
    setPreviewUrl((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return "";
    });
  };

  const handleBarcodeScan = async () => {
    // Use native BarcodeDetector when available (Chrome/Edge), else fall back to manual entry.
    try {
      const W = window as unknown as { BarcodeDetector?: new (opts?: object) => { detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue: string }>> } };
      if (W.BarcodeDetector && fileInputRef.current) {
        toast({ title: "Barcode mode", description: "Upload a photo of the barcode — we'll detect it." });
        setShowBarcode(true);
        return;
      }
    } catch {
      /* ignore */
    }
    setShowBarcode((v) => !v);
  };

  const clearAnalysisRef = useRef(processFile);
  useEffect(() => {
    clearAnalysisRef.current = processFile;
  });

  useEffect(() => {
    const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes("Files");
    const prevent = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      if ((e.target as HTMLElement)?.closest?.("[data-dropzone]")) return;
      const file = e.dataTransfer?.files?.[0];
      if (file) clearAnalysisRef.current(file);
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  // Real stats derived from actual usage
  const mealsLogged = logs.length;
  const dayKeys = Array.from(new Set(logs.map((l) => dayKey(l.logged_at))));
  const streak = calcStreak(dayKeys);
  const searches = history.length;

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

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for any food... (e.g., apple, chicken, rice)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 text-base shadow-card"
                  aria-label="Search for food nutrition"
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
              <Button type="button" variant="outline" size="xl" onClick={handleBarcodeScan} aria-label="Scan barcode" title="Scan packaged food barcode">
                <Barcode className="w-5 h-5" />
              </Button>
            </div>
          </form>

          {showBarcode && (
            <div className="max-w-2xl mx-auto mb-4 flex gap-2 animate-fade-in">
              <Input
                placeholder="Enter barcode (e.g. 3017620422003)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                inputMode="numeric"
                aria-label="Product barcode"
              />
              <Button type="button" variant="secondary" onClick={() => lookupByBarcode(barcode)} disabled={isLoading || !barcode.trim()}>
                Look up
              </Button>
            </div>
          )}

          {notFound && (
            <div className="max-w-2xl mx-auto mb-4 flex items-start justify-between gap-3 p-4 rounded-xl bg-card border border-border/60 text-left animate-fade-in" role="status">
              <div>
                <p className="font-medium text-foreground">No food found for &lsquo;{notFound}&rsquo;.</p>
                <p className="text-sm text-muted-foreground mt-0.5">Please check the spelling and try again.</p>
              </div>
              <button
                type="button"
                onClick={clearNutritionData}
                aria-label="Dismiss no-result message"
                className="text-muted-foreground hover:text-foreground text-lg leading-none px-1"
              >
                ×
              </button>
            </div>
          )}

          {nutritionData && lastMatches.length > 0 && (
            <div className="max-w-2xl mx-auto mb-4 flex flex-wrap items-center justify-center gap-2 animate-fade-in">
              <span className="text-xs text-muted-foreground">Also found:</span>
              {lastMatches.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => lookupNutrition(m)}
                  className="text-xs px-3 py-1.5 rounded-full bg-card border border-border/60 hover:border-primary/60 hover:text-primary transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <div className="max-w-2xl mx-auto mb-8 flex flex-wrap items-center justify-center gap-2 animate-fade-in">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><History className="w-3.5 h-3.5" /> Recent:</span>
              {history.slice(0, 5).map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => { setSearchQuery(h); lookupNutrition(h); }}
                  className="text-xs px-3 py-1.5 rounded-full bg-card border border-border/60 hover:border-primary/60 hover:text-primary transition-colors"
                >
                  {h}
                </button>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            id="meal-photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            className={`max-w-2xl mx-auto animate-fade-in-up ${isDragging ? "scale-105" : ""}`}
            style={{ animationDelay: "0.4s" }}
          >
            <div
              data-dropzone
              role="button"
              tabIndex={0}
              aria-label="Upload food photo for analysis. Press Enter to browse files."
              className={`relative p-8 md:p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-card/50 backdrop-blur-sm"
              }`}
              onClick={() => {
                if (isAnalyzing) return;
                if (!fileInputRef.current) {
                  console.error("[NutriVeda] file input ref is null");
                  toast({ title: "Upload unavailable", description: "Please refresh the page and try again.", variant: "destructive" });
                  return;
                }
                fileInputRef.current.click();
              }}
              onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !isAnalyzing) { e.preventDefault(); fileInputRef.current?.click(); } }}
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
                  {/* Native label trigger: opens the picker without JS, so an
                      upload works even if programmatic .click() is blocked. */}
                  <label
                    htmlFor="meal-photo-input"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center justify-center gap-2 h-12 rounded-lg px-8 text-base border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            {[
              { value: String(mealsLogged), label: "Meals logged" },
              { value: streak > 0 ? `${streak}d` : "—", label: "Day streak" },
              { value: String(searches), label: "Foods searched" },
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
