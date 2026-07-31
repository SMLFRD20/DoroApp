import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Timer, Circle, CheckCircle2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";

interface Task {
  id: number;
  name: string;
  priority: "Alta" | "Media" | "Baja";
  pomodoros: number;
  completedPomodoros: number;
  status: "Pendiente" | "En progreso" | "Completada";
}

export default function Tasks() {
  const [tasks] = useState<Task[]>([
    {
      id: 1,
      name: "Investigación de Programación Paralela",
      priority: "Alta",
      pomodoros: 4,
      completedPomodoros: 2,
      status: "En progreso",
    },
    {
      id: 2,
      name: "Aplicación en Flutter para Joerlyn",
      priority: "Media",
      pomodoros: 6,
      completedPomodoros: 0,
      status: "Pendiente",
    },
    {
      id: 3,
      name: "Escribir documentación para Rina",
      priority: "Media",
      pomodoros: 3,
      completedPomodoros: 0,
      status: "Pendiente",
    },
    {
      id: 4,
      name: "Revisar correos de UNIBE",
      priority: "Baja",
      pomodoros: 1,
      completedPomodoros: 1,
      status: "Completada",
    },
    {
      id: 5,
      name: "Realizar Pruebín de Raisa",
      priority: "Alta",
      pomodoros: 2,
      completedPomodoros: 2,
      status: "Completada",
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-destructive/15 text-destructive";
      case "Media":
        return "bg-secondary text-secondary-foreground";
      case "Baja":
        return "bg-primary/15 text-primary-foreground";
      default:
        return "bg-accent text-accent-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completada":
        return <CheckCircle2 className="w-6 h-6 text-primary" />;
      case "En progreso":
        return <Circle className="w-6 h-6 text-destructive fill-destructive/20" />;
      default:
        return <Circle className="w-6 h-6 text-border" />;
    }
  };

  const pendingTasks = tasks.filter((t) => t.status !== "Completada");
  const completedTasks = tasks.filter((t) => t.status === "Completada");

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background p-6 font-sans pb-10 flex flex-col relative">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 mt-2"
      >
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Tu Enfoque</h1>
        <p className="text-sm text-muted-foreground">
          {pendingTasks.length} semillas por plantar · {completedTasks.length} florecidas
        </p>
      </motion.div>

      {/* Tasks Summary */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-3 mb-8"
      >
        <motion.div variants={item}>
          <Card className="p-4 bg-card rounded-3xl shadow-sm border border-border/50 text-center flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold text-foreground mb-0.5">{tasks.length}</p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total</p>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="p-4 bg-card rounded-3xl shadow-sm border border-border/50 text-center flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold text-destructive mb-0.5">{pendingTasks.length}</p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Activas</p>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="p-4 bg-card rounded-3xl shadow-sm border border-border/50 text-center flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold text-primary mb-0.5">{completedTasks.length}</p>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Hechas</p>
          </Card>
        </motion.div>
      </motion.div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="mb-8 relative z-10">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 ml-1"
          >
            En Crecimiento
          </motion.h2>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {pendingTasks.map((task) => (
              <motion.div key={task.id} variants={item}>
                <Card
                  className="p-4 bg-card rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <button className="mt-1 transition-transform group-hover:scale-110 active:scale-95 cursor-pointer">
                      {getStatusIcon(task.status)}
                    </button>
                    <div className="flex-1">
                      <h3 className="text-[15px] font-semibold text-foreground mb-2 leading-tight">{task.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold border-none px-2 py-0.5 ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 bg-accent px-2 py-1 rounded-full">
                          <Timer className="w-3 h-3" />
                          {task.completedPomodoros}/{task.pomodoros}
                        </span>
                      </div>
                      {task.status === "En progreso" && (
                        <div className="mt-4">
                          <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(task.completedPomodoros / task.pomodoros) * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-destructive rounded-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mb-8 relative z-10">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 ml-1"
          >
            Completadas
          </motion.h2>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {completedTasks.map((task) => (
              <motion.div key={task.id} variants={item}>
                <Card
                  className="p-4 bg-accent/30 rounded-3xl shadow-none border border-transparent opacity-80"
                >
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">{getStatusIcon(task.status)}</div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-muted-foreground line-through">{task.name}</h3>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Floating Action Button (Sticky for mobile view) */}
      <div className="sticky bottom-4 w-full flex justify-end pointer-events-none z-50 mt-auto">
        <motion.div 
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ stiffness: 260, damping: 20, delay: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto"
        >
          <Button className="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_20px_rgba(168,195,160,0.5)]">
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
