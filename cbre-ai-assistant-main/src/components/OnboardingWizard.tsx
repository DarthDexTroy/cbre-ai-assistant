import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, 
  Shield, 
  MapPin, 
  Search,
  TrendingUp,
  ArrowRight,
  Check
} from "lucide-react";
import { completeOnboarding } from "@/lib/localStorage";

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

const OnboardingWizard = ({ open, onComplete }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome to AI Real Estate Intelligence",
      description: "Your trusted platform for verified property data powered by AI. We combine CBRE's proprietary database with real-time external verification to give you the most reliable insights.",
      features: [
        "Natural language search",
        "AI-powered analysis",
        "Real-time verification",
      ],
    },
    {
      icon: Shield,
      title: "Trust Through Transparency",
      description: "Every property comes with a trust score showing data confidence. We verify information across multiple sources and highlight any gaps or anomalies.",
      features: [
        "Multi-source verification",
        "Confidence scoring",
        "Anomaly detection",
      ],
    },
    {
      icon: MapPin,
      title: "Interactive Property Discovery",
      description: "Explore properties on an interactive map with smart clustering. Filter by status, class, and trust score to find exactly what you need.",
      features: [
        "Map-based browsing",
        "Advanced filters",
        "Save favorites",
      ],
    },
    {
      icon: Search,
      title: "Ask the AI Anything",
      description: "Use natural language to ask complex questions about properties, markets, and risks. Get synthesized answers with cited sources.",
      features: [
        "Natural language queries",
        "Market analysis",
        "Risk assessment",
      ],
    },
    {
      icon: TrendingUp,
      title: "Stay Informed with Alerts",
      description: "Track properties and get automatic notifications when we detect changes from external sources like price updates, legal issues, or market shifts.",
      features: [
        "Automated monitoring",
        "Change detection",
        "Smart notifications",
      ],
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      onComplete();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    onComplete();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl glass border-2 border-primary/20">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="pt-8 pb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-float">
                <Icon className="h-10 w-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-3">
              {currentStep.title}
            </h2>
            
            <p className="text-muted-foreground text-center mb-6 max-w-lg mx-auto">
              {currentStep.description}
            </p>

            {/* Features */}
            <div className="grid gap-3 mb-8">
              {currentStep.features.map((feature, idx) => (
                <Card 
                  key={idx}
                  className="bg-muted/50 p-4 flex items-center gap-3 animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </Card>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip Tour
              </Button>

              <div className="flex items-center gap-2">
                {/* Step indicators */}
                <div className="flex gap-1.5 mr-4">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === step
                          ? 'bg-primary w-6'
                          : idx < step
                          ? 'bg-primary/50'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                <Button onClick={handleNext} size="lg">
                  {step < steps.length - 1 ? (
                    <>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Get Started <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
