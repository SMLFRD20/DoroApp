import image_imagen_2026_06_26_140203897 from '@/imports/imagen_2026-06-26_140203897.png'
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Timer, Clock, TrendingUp, CheckCircle2, ChevronRight, Sprout, Target, Coffee } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { useState, useEffect } from "react";
import { ApiService } from "../services/apiService";

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const firstName = session?.user?.user_metadata?.first_name || "Semilla";

  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [pomodoros, setPomodoros] = useState<any[]>([]);
  const [nextTask, setNextTask] = useState<any>(null);
  const [quote, setQuote] = useState({ content: "La naturaleza no se apresura, sin embargo todo se logra.", author: "Lao Tsé" });

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
      fetchPomodoros();
    }
    
    // Fetch random quote
    const quoteApi = new ApiService("https://dummyjson.com");
    quoteApi.fetchData().then((data) => {
      if (data && data.quote) {
        setQuote({ content: data.quote, author: data.author });
      } else if (data && data.content) {
        setQuote({ content: data.content, author: data.author });
      }
    }).catch(e => console.error("Error fetching quote:", e));
  }, [session]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      const allTasks = data || [];
      setTasks(allTasks);
      setCompletedTasksCount(allTasks.filter(t => t.is_completed).length);
      
      const pending = allTasks.filter(t => !t.is_completed);
      setPendingTasksCount(pending.length);
      
      if (pending.length > 0) {
        setNextTask(pending[0]);
      }
    } catch (error) {
      console.error("Error fetching tasks for dashboard:", error);
    }
  };

  const fetchPomodoros = async () => {
    try {
      // Get today's beginning
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('type', 'work')
        .gte('created_at', today.toISOString());
        
      if (!error && data) setPomodoros(data);
    } catch (error) {
      console.error("Error fetching pomodoros:", error);
    }
  };

  const totalPomodorosGoal = 8;
  const currentPomodoros = pomodoros.length;
  const progressPercent = Math.min((currentPomodoros / totalPomodorosGoal) * 100, 100);
  
  // Fake productivity calculation for demo purposes (based on completed tasks)
  const productivity = tasks.length > 0 
    ? Math.round((completedTasksCount / tasks.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      {/* Header with Greeting & Avatar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-8 mt-2"
      >
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">¡Buenos días, {firstName}!</h1>
          <p className="text-sm text-muted-foreground">Encuentra tu ritmo hoy</p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 overflow-hidden shadow-sm flex items-center justify-center bg-primary/10 text-primary font-bold">
          {firstName.charAt(0).toUpperCase()}
        </div>
      </motion.div>

      {/* Boho Illustration & Quote Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="relative overflow-hidden bg-primary text-primary-foreground p-6 rounded-3xl shadow-[0_8px_30px_rgba(168,195,160,0.3)] border-0 mb-8">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sprout className="w-5 h-5 opacity-90" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-90">Inspiración</span>
            </div>
            <p className="text-lg font-medium leading-relaxed mb-1 pr-12">
              "La naturaleza no se apresura, sin embargo todo se logra."
            </p>
            <p className="text-xs opacity-75">— Lao Tsé</p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
            <img src="https://images.unsplash.com/photo-1606820049560-cfaa8cba5859?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Boho Leaves" className="w-full h-full object-cover mix-blend-overlay" />
          </div>
        </Card>
      </motion.div>

      {/* Daily Goal Progress */}
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Objetivo Diario
          </h2>
          <span className="text-xs font-medium text-muted-foreground">{currentPomodoros}/{totalPomodorosGoal} Pomodoros</span>
        </div>
        <Card className="p-4 bg-card rounded-2xl shadow-sm border border-border/50">
          <Progress value={progressPercent} className="h-2.5 mb-3 bg-accent" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>En progreso</span>
            <span>{Math.round(progressPercent)}% completado</span>
          </div>
        </Card>
      </motion.div>

      {/* Grid Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <Card className="p-5 bg-card rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border/50 flex flex-col justify-between aspect-square">
          <div className="w-10 h-10 bg-primary/15 rounded-2xl flex items-center justify-center mb-4">
            <Timer className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-semibold text-foreground mb-1">{currentPomodoros * 25}<span className="text-base font-normal text-muted-foreground ml-1">min</span></p>
            <p className="text-xs text-muted-foreground font-medium">Tiempo de enfoque</p>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-4 bg-card rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border/50 flex-1 flex items-center gap-4">
             <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0">
               <CheckCircle2 className="w-5 h-5 text-secondary-foreground" />
             </div>
             <div>
               <p className="text-lg font-semibold text-foreground leading-none mb-1">{completedTasksCount}</p>
               <p className="text-[10px] text-muted-foreground font-medium leading-tight">Tareas listas</p>
             </div>
          </Card>
          <Card className="p-4 bg-card rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border/50 flex-1 flex items-center gap-4">
             <div className="w-10 h-10 bg-destructive/15 rounded-xl flex items-center justify-center shrink-0">
               <TrendingUp className="w-5 h-5 text-destructive" />
             </div>
             <div>
               <p className="text-lg font-semibold text-foreground leading-none mb-1">{productivity}%</p>
               <p className="text-[10px] text-muted-foreground font-medium leading-tight">Productividad</p>
             </div>
          </Card>
        </div>
      </motion.div>

      {/* Start Pomodoro CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => navigate("/app/timer")}
          className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_8px_20px_rgba(168,195,160,0.4)] mb-8 text-lg font-medium transition-all duration-300 active:scale-[0.98]"
        >
          <Timer className="w-6 h-6 mr-2" />
          Iniciar Enfoque
        </Button>
      </motion.div>

      {/* Next Break / Upcoming */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-6"
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">Siguiente en la agenda</h2>
        <Card className="p-4 bg-card rounded-2xl shadow-sm border border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden mr-2">
             <div className="w-10 h-10 bg-accent/50 rounded-full flex items-center justify-center shrink-0">
               {nextTask ? <Target className="w-4 h-4 text-secondary-foreground" /> : <Coffee className="w-4 h-4 text-secondary-foreground" />}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-semibold text-foreground mb-0.5 line-clamp-1">{nextTask ? nextTask.title : "Tómate un descanso"}</p>
               <p className="text-[11px] text-muted-foreground">{nextTask ? `Estimado: ${nextTask.expected_pomodoros} pomodoros` : "No hay tareas activas"}</p>
             </div>
          </div>
          <Button 
            onClick={() => nextTask ? navigate(`/app/timer?taskId=${nextTask.id}`) : navigate("/app/tasks")}
            size="sm"
            className="shrink-0 rounded-full h-8 px-4 text-xs font-semibold shadow-md active:scale-95 transition-transform"
          >
            {nextTask ? "Iniciar" : "Ver Tareas"}
          </Button>
        </Card>
      </motion.div>

      {/* Daily Inspiration */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-6"
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">Inspiración Diaria</h2>
        <Card className="p-4 bg-card rounded-2xl shadow-sm border border-primary/20 flex flex-col justify-between">
          <div className="flex items-start gap-4 mb-3">
             <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
               <Sprout className="w-5 h-5 text-primary" />
             </div>
             <div>
               <p className="text-sm font-medium text-foreground italic">"{quote.content}"</p>
               <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
             </div>
          </div>
        </Card>
      </motion.div>

    </div>
  );
}
