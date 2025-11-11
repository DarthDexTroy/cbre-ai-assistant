import { getTrustScoreColor, getTrustScoreLabel } from "@/lib/gemini";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

interface TrustScoreMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const TrustScoreMeter = ({ 
  score, 
  size = "md", 
  showLabel = true,
  animated = true 
}: TrustScoreMeterProps) => {
  const colorClass = getTrustScoreColor(score);
  const label = getTrustScoreLabel(score);
  
  const sizeClasses = {
    sm: "w-16 h-16 text-xs",
    md: "w-24 h-24 text-sm",
    lg: "w-32 h-32 text-base",
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 36,
  };

  const getIcon = () => {
    if (score >= 80) return <CheckCircle2 size={iconSizes[size]} />;
    if (score >= 60) return <Shield size={iconSizes[size]} />;
    return <AlertTriangle size={iconSizes[size]} />;
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${sizeClasses[size]} ${animated ? 'animate-float' : ''}`}>
        {/* Background circle */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            opacity="0.2"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`hsl(var(--${colorClass}))`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px hsl(var(--${colorClass}) / 0.5))`,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-${colorClass} mb-1`}>
            {getIcon()}
          </div>
          <div className={`font-bold text-${colorClass}`}>
            {score}
          </div>
        </div>
      </div>

      {showLabel && (
        <div className="text-center">
          <div className={`font-semibold text-${colorClass}`}>
            {label}
          </div>
          <div className="text-xs text-muted-foreground">Trust Score</div>
        </div>
      )}
    </div>
  );
};

export default TrustScoreMeter;
