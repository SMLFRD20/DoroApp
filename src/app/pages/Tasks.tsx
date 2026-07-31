import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Timer, Circle, CheckCircle2, Sprout, Play } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { supabase } from "../services/supabaseClient";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface Task {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  expected_pomodoros: number;
}

export default function Tasks() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPomodoros, setNewTaskPomodoros] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast.error("Error al cargar las tareas");
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !task.is_completed })
        .eq('id', task.id);
      
      if (error) throw error;
      setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: !task.is_completed } : t));
    } catch (error) {
      toast.error("Error al actualizar la tarea");
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !session?.user) return;
    
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: newTaskTitle,
          description: newTaskDescription,
          user_id: session.user.id,
          expected_pomodoros: newTaskPomodoros
        }])
        .select()
        .single();
      
      if (error) throw error;
      if (data) setTasks([data, ...tasks]);
      toast.success("Tarea creada con éxito");
      
      // Reset form and close
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPomodoros(1);
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al crear la tarea");
    } finally {
      setIsCreating(false);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);

  const getPriorityColor = () => "bg-secondary text-secondary-foreground";

  const getStatusIcon = (isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle2 className="w-6 h-6 text-primary" />;
    }
    return <Circle className="w-6 h-6 text-border" />;
  };

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
                    <button onClick={() => toggleTaskCompletion(task)} className="mt-1 transition-transform group-hover:scale-110 active:scale-95 cursor-pointer">
                      {getStatusIcon(task.is_completed)}
                    </button>
                    <div className="flex-1">
                      <h3 className="text-[15px] font-semibold text-foreground mb-1 leading-tight">{task.title}</h3>
                      {task.description && <p className="text-[12px] text-muted-foreground mb-2">{task.description}</p>}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 bg-accent/50 px-2 py-1 rounded-full">
                            <Timer className="w-3 h-3" />
                            0/{task.expected_pomodoros}
                          </span>
                        </div>
                        <Button 
                          onClick={() => navigate(`/app/timer?taskId=${task.id}`)}
                          size="sm" 
                          className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 transition-transform active:scale-95 shadow-md flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Enfocarse
                        </Button>
                      </div>
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
                    <button onClick={() => toggleTaskCompletion(task)} className="shrink-0 cursor-pointer">{getStatusIcon(task.is_completed)}</button>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-muted-foreground line-through">{task.title}</h3>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-10"
        >
          <div className="w-24 h-24 bg-card border border-border/50 rounded-full flex items-center justify-center shadow-sm mb-6">
            <Sprout className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Tu jardín está vacío</h3>
          <p className="text-sm text-muted-foreground max-w-[250px]">
            Planta tu primera semilla tocando el botón de abajo y empieza a enfocarte.
          </p>
        </motion.div>
      )}

      {/* Floating Action Button (Sticky for mobile view) */}
      <div className="sticky bottom-4 w-full flex justify-end pointer-events-none z-50 mt-auto">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
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
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-border/50">
            <DialogHeader>
              <DialogTitle className="text-xl">Plantar nueva semilla</DialogTitle>
              <DialogDescription>
                Agrega una tarea nueva y estima cuántos pomodoros te tomará.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addTask}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground ml-1">
                    Título
                  </Label>
                  <Input
                    id="title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                    className="col-span-3 rounded-xl h-12 bg-card border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground ml-1">
                    Descripción (opcional)
                  </Label>
                  <Input
                    id="description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="col-span-3 rounded-xl h-12 bg-card border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pomodoros" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground ml-1">
                    Pomodoros estimados ({newTaskPomodoros} ciclos)
                  </Label>
                  <Input
                    id="pomodoros"
                    type="number"
                    min="1"
                    max="10"
                    value={newTaskPomodoros}
                    onChange={(e) => setNewTaskPomodoros(parseInt(e.target.value))}
                    className="col-span-3 rounded-xl h-12 bg-card border-border/50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={isCreating} type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90">
                  {isCreating ? "Guardando..." : "Plantar semilla"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
