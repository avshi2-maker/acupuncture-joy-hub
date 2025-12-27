import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Users, Brain, Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Users, label: "Patient Management", delay: 0 },
  { icon: Brain, label: "AI-Powered TCM Brain", delay: 0.5 },
  { icon: Calendar, label: "Smart Scheduling", delay: 1 },
  { icon: TrendingUp, label: "ROI Analytics", delay: 1.5 },
];

const TherapistTeaser = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const navigate = useNavigate();

  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentFeature(0);
    
    // Animate through features
    const interval = setInterval(() => {
      setCurrentFeature((prev) => {
        if (prev >= features.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsPlaying(false);
            setShowDialog(true);
          }, 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            For TCM Practitioners
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Grow Your Practice with AI
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join practitioners who are using our platform to streamline patient care, 
            leverage TCM knowledge, and grow their clinics.
          </p>
        </div>

        {/* Video Teaser Container */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-jade/20 to-gold/10 border border-border/50 shadow-elevated aspect-video cursor-pointer group"
            onClick={!isPlaying ? handlePlay : undefined}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--jade)/0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,hsl(var(--gold)/0.2),transparent_50%)]" />
            
            {!isPlaying ? (
              /* Play Button State */
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  See How It Works
                </h3>
                <p className="text-muted-foreground text-sm">
                  30-second platform overview
                </p>
              </div>
            ) : (
              /* Playing Animation State */
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                  {features.map((feature, index) => (
                    <div
                      key={feature.label}
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-500 ${
                        index <= currentFeature
                          ? "bg-background/80 shadow-lg scale-100 opacity-100"
                          : "bg-background/20 scale-95 opacity-40"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        index <= currentFeature ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <span className={`font-medium ${
                        index <= currentFeature ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {feature.label}
                      </span>
                      {index <= currentFeature && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto animate-scale-in" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-linear"
                  style={{ width: `${((currentFeature + 1) / features.length) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/therapist-register")}
              className="bg-primary hover:bg-primary/90"
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/encyclopedia")}
            >
              Explore Features
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Ready to Transform Your Practice?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature.label}</span>
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={() => { setShowDialog(false); navigate("/therapist-register"); }}>
                Start Free Trial
              </Button>
              <Button variant="ghost" onClick={() => setShowDialog(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TherapistTeaser;
