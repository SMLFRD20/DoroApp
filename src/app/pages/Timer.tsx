import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Play, Pause, RotateCcw, ArrowLeft, Coffee, Target } from "lucide-react";
import { cn } from "../components/ui/utils";

export default function Timer() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const totalTime = 25 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="min-h-screen bg-background p-6 font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8 mt-2 relative">
        <button
          onClick={() => navigate("/app")}
          className="absolute left-0 w-10 h-10 rounded-full bg-card shadow-sm border border-border/50 flex items-center justify-center transition-transform active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-full text-center">
          <h1 className="text-lg font-semibold text-foreground">Sesión de Enfoque</h1>
          <p className="text-xs text-muted-foreground font-medium">Pomodoro 2 de 4</p>
        </div>
      </div>

      {/* Timer Circle */}
      <div className="flex flex-col items-center justify-center flex-1 my-8">
        <div className="relative w-[280px] h-[280px]">
          {/* Decorative outer glow/shadow */}
          <div className="absolute inset-4 rounded-full shadow-[0_0_60px_rgba(168,195,160,0.2)]"></div>
          
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
            <circle
              cx="140"
              cy="140"
              r="126"
              stroke="var(--accent)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r="126"
              stroke="var(--primary)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 126}`}
              strokeDashoffset={`${2 * Math.PI * 126 * (1 - progressPercentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-light text-foreground mb-2 tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm font-medium text-muted-foreground px-4 py-1.5 bg-accent/50 rounded-full">
              {isRunning ? "Fluyendo..." : "En pausa"}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-6 mb-12">
        <Button
          onClick={handleReset}
          variant="outline"
          className="w-14 h-14 rounded-full border border-border bg-card shadow-sm hover:bg-accent hover:text-primary transition-all text-muted-foreground"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => setIsRunning(!isRunning)}
          className={cn(
            "w-20 h-20 rounded-full shadow-[0_8px_25px_rgba(168,195,160,0.5)] transition-all duration-300 active:scale-95",
            isRunning ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
          )}
        >
          {isRunning ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </Button>

        <Button
          variant="outline"
          className="w-14 h-14 rounded-full border border-border bg-card shadow-sm hover:bg-accent hover:text-primary transition-all text-muted-foreground"
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(5 * 60);
          }}
        >
          <span className="text-sm font-medium">5m</span>
        </Button>
      </div>

      {/* Quick Stats Below */}
      <div className="grid grid-cols-2 gap-4 mt-auto">
        <Card className="p-4 bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center text-center">
          <Target className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground mb-1">Tarea actual</p>
          <p className="text-sm font-semibold text-foreground line-clamp-1">Investigación de Programación Paralela</p>
        </Card>
        <Card className="p-4 bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center text-center">
          <Coffee className="w-5 h-5 text-secondary-foreground mb-2" />
          <p className="text-xs text-muted-foreground mb-1">Siguiente pausa</p>
          <p className="text-sm font-semibold text-foreground line-clamp-1">5 min</p>
        </Card>
      </div>
    </div>
  );
}
