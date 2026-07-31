import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Play, Pause, RotateCcw, ArrowLeft, Coffee, Target } from "lucide-react";
import { cn } from "../components/ui/utils";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

type TimerMode = "WORK" | "SHORT_BREAK" | "LONG_BREAK";

export default function Timer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  const { session } = useAuth();

  const [task, setTask] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>("WORK");
  
  const getInitialTime = (m: TimerMode) => {
    switch(m) {
      case "WORK": return 25 * 60;
      case "SHORT_BREAK": return 5 * 60;
      case "LONG_BREAK": return 15 * 60;
    }
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime("WORK"));
  const [totalTime, setTotalTime] = useState(getInitialTime("WORK"));

  // Fetch current task if taskId is provided
  useEffect(() => {
    if (taskId && session?.user) {
      supabase.from("tasks").select("*").eq("id", taskId).single()
        .then(({ data, error }) => {
          if (data) setTask(data);
          if (error) console.error("Error fetching task:", error);
        });
    }
  }, [taskId, session]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const saveSessionAndCheckTask = async () => {
    if (!session?.user) {
      toast.error("No hay sesión de usuario activa.");
      return;
    }
    if (!taskId || !task) {
      toast.error("Modo libre: No hay tarea seleccionada, el pomodoro no se registrará en las estadísticas.");
      return;
    }
    try {
      // 1. Guardar la sesión
      const { error: insertError } = await supabase.from("pomodoro_sessions").insert([{
        task_id: taskId,
        user_id: session.user.id,
        duration: 25,
        type: "work"
      }]);

      if (insertError) {
        console.error("Insert error:", insertError);
        toast.error(`Error guardando pomodoro: ${insertError.message} (Código: ${insertError.code})`);
        return;
      }

      // 2. Verificar cuántos pomodoros tiene esta tarea
      const { data: sessions, error: selectError } = await supabase
        .from("pomodoro_sessions")
        .select("id")
        .eq("task_id", taskId)
        .eq("type", "work");
        
      if (selectError) {
        console.error("Select sessions error:", selectError);
      }
        
      const completedCount = sessions ? sessions.length : 1;

      // 3. Autocompletar la tarea si se alcanzó la meta
      if (completedCount >= task.expected_pomodoros) {
        if (!task.is_completed) {
          const { error: updateError } = await supabase
            .from("tasks")
            .update({ is_completed: true })
            .eq("id", taskId);
            
          if (updateError) {
            console.error("Update task error:", updateError);
            toast.error("No se pudo autocompletar la tarea.");
          } else {
            toast.success(`¡Felicidades! Completaste la meta de "${task.title}".`);
            setTask({ ...task, is_completed: true });
            
            // Redirect away to prevent infinite skipping
            setTimeout(() => {
              navigate("/app/tasks");
            }, 2000);
          }
        } else {
          // If they somehow stayed on the screen and kept skipping
          toast.info("Esta tarea ya fue completada.");
          navigate("/app/tasks");
        }
      }
    } catch (e: any) {
      console.error("Failed to save session", e);
      toast.error(`Excepción: ${e.message}`);
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (mode === "WORK") {
      toast.success("¡Pomodoro registrado! Buen trabajo.");
      await saveSessionAndCheckTask();
      switchMode("SHORT_BREAK");
    } else {
      toast.success("Descanso terminado. ¡A enfocarse!");
      switchMode("WORK");
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    const newTime = getInitialTime(newMode);
    setTimeLeft(newTime);
    setTotalTime(newTime);
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="min-h-screen bg-background p-6 font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-8 mt-2 relative">
        <button
          onClick={() => navigate("/app/tasks")}
          className="absolute left-0 w-10 h-10 rounded-full bg-card shadow-sm border border-border/50 flex items-center justify-center transition-transform active:scale-95 z-10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-full text-center">
          <h1 className="text-lg font-semibold text-foreground">
            {mode === "WORK" ? "Sesión de Enfoque" : "Descanso"}
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            {mode === "WORK" ? "Pomodoro Activo" : mode === "SHORT_BREAK" ? "Descanso Corto" : "Descanso Largo"}
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => switchMode("WORK")}
          className={cn("rounded-full text-xs h-8", mode === "WORK" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card")}
        >
          Trabajo
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => switchMode("SHORT_BREAK")}
          className={cn("rounded-full text-xs h-8", mode === "SHORT_BREAK" ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "bg-card")}
        >
          Corto
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => switchMode("LONG_BREAK")}
          className={cn("rounded-full text-xs h-8", mode === "LONG_BREAK" ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-card")}
        >
          Largo
        </Button>
      </div>

      {/* Timer Circle */}
      <div className="flex flex-col items-center justify-center flex-1 my-4">
        <div className="relative w-[280px] h-[280px]">
          {/* Decorative outer glow/shadow */}
          <div className={cn("absolute inset-4 rounded-full shadow-[0_0_60px_rgba(0,0,0,0.1)]", 
            mode === "WORK" ? "shadow-primary/20" : "shadow-secondary/20"
          )}></div>
          
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
            <circle cx="140" cy="140" r="126" stroke="var(--border)" strokeWidth="8" fill="none" opacity={0.5} />
            {/* Progress circle */}
            <circle
              cx="140" cy="140" r="126" 
              stroke={mode === "WORK" ? "var(--primary)" : "var(--secondary)"}
              strokeWidth="12" fill="none"
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
            <div className={cn("text-sm font-medium px-4 py-1.5 rounded-full mt-2",
              isRunning ? (mode === "WORK" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary-foreground") : "bg-muted text-muted-foreground"
            )}>
              {isRunning ? (mode === "WORK" ? "Enfocado..." : "Relajando...") : "En pausa"}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-6 mb-8">
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
            "w-20 h-20 rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all duration-300 active:scale-95",
            mode === "WORK" 
              ? (isRunning ? "bg-primary/90 text-primary-foreground" : "bg-primary text-primary-foreground")
              : (isRunning ? "bg-secondary/90 text-secondary-foreground" : "bg-secondary text-secondary-foreground")
          )}
        >
          {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </Button>

        <div className="w-14 h-14"></div> {/* Spacer to keep play button centered */}
      </div>

      {/* Quick Stats Below */}
      <div className="grid grid-cols-2 gap-4 mt-auto">
        <Card className="p-4 bg-card rounded-2xl shadow-sm border border-border/50 flex flex-col items-center justify-center text-center overflow-hidden">
          <Target className="w-5 h-5 text-primary mb-2 shrink-0" />
          <p className="text-xs text-muted-foreground mb-1 shrink-0">Tarea actual</p>
          <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
            {task ? task.title : "Sin tarea seleccionada"}
          </p>
        </Card>
        <Button 
          className="h-auto p-4 rounded-2xl shadow-md border-0 flex flex-col items-center justify-center text-center transition-transform active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleTimerComplete}
        >
          <Coffee className="w-5 h-5 mb-2 shrink-0 opacity-80" />
          <span className="text-xs mb-1 shrink-0 opacity-90">Siguiente fase</span>
          <span className="text-sm font-bold line-clamp-1">
            {mode === "WORK" ? "Saltar a Descanso" : "Saltar a Trabajo"}
          </span>
        </Button>
      </div>
    </div>
  );
}
