import image_imagen_2026_06_26_140203897 from '@/imports/imagen_2026-06-26_140203897.png'
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Timer, Clock, TrendingUp, CheckCircle2, ChevronRight, Sprout, Target, Coffee } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { motion } from "motion/react";

export default function Dashboard() {
  const navigate = useNavigate();

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
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">¡Buenos días, Sergio!</h1>
          <p className="text-sm text-muted-foreground">Encuentra tu ritmo hoy</p>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 overflow-hidden shadow-sm">
          <img src={image_imagen_2026_06_26_140203897} alt="Avatar" className="w-full h-full object-cover" />
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
          <span className="text-xs font-medium text-muted-foreground">4/8 Pomodoros</span>
        </div>
        <Card className="p-4 bg-card rounded-2xl shadow-sm border border-border/50">
          <Progress value={50} className="h-2.5 mb-3 bg-accent" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>En progreso</span>
            <span>50% completado</span>
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
            <p className="text-3xl font-semibold text-foreground mb-1">120<span className="text-base font-normal text-muted-foreground ml-1">min</span></p>
            <p className="text-xs text-muted-foreground font-medium">Tiempo de enfoque</p>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-4 bg-card rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border/50 flex-1 flex items-center gap-4">
             <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0">
               <CheckCircle2 className="w-5 h-5 text-secondary-foreground" />
             </div>
             <div>
               <p className="text-lg font-semibold text-foreground leading-none mb-1">5</p>
               <p className="text-[10px] text-muted-foreground font-medium leading-tight">Tareas listas</p>
             </div>
          </Card>
          <Card className="p-4 bg-card rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border/50 flex-1 flex items-center gap-4">
             <div className="w-10 h-10 bg-destructive/15 rounded-xl flex items-center justify-center shrink-0">
               <TrendingUp className="w-5 h-5 text-destructive" />
             </div>
             <div>
               <p className="text-lg font-semibold text-foreground leading-none mb-1">87%</p>
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
        <Card className="p-4 bg-card rounded-2xl shadow-sm border border-border/50 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate("/app/tasks")}>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
               <Coffee className="w-5 h-5 text-secondary-foreground" />
             </div>
             <div>
               <p className="text-sm font-medium text-foreground mb-1">Descanso largo</p>
               <p className="text-xs text-muted-foreground">En 2 pomodoros (50 min)</p>
             </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Card>
      </motion.div>

      {/* Homework Demo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-6"
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">Inspiración Diaria</h2>
        <Card className="p-4 bg-card rounded-2xl shadow-sm border border-primary/20 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate("/app/api-demo")}>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
               <Sprout className="w-5 h-5 text-primary" />
             </div>
             <div>
               <p className="text-sm font-medium text-foreground mb-1">Cita del Día</p>
               <p className="text-xs text-muted-foreground">Encuentra tu centro</p>
             </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Card>
      </motion.div>

    </div>
  );
}
