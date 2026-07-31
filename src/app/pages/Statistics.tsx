import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Clock, Target, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "../components/ui/utils";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

export default function Statistics() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [pomodoros, setPomodoros] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
      fetchPomodoros();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*');
      if (!error && data) setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchPomodoros = async () => {
    try {
      const { data, error } = await supabase.from('pomodoro_sessions').select('*').eq('type', 'work');
      if (!error && data) setPomodoros(data);
    } catch (error) {
      console.error("Error fetching pomodoros:", error);
    }
  };

  const completedTasksCount = tasks.filter(t => t.is_completed).length;
  const totalTasksCount = tasks.length;
  
  const productivity = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  // Real pomodoros count
  const completedPomodoros = pomodoros.length;
  const totalHours = pomodoros.reduce((acc, p) => acc + (p.duration || 25), 0) / 60;

  // Process Weekly Data
  const getWeeklyData = () => {
    const data = [
      { day: "Lun", hours: 0 },
      { day: "Mar", hours: 0 },
      { day: "Mié", hours: 0 },
      { day: "Jue", hours: 0 },
      { day: "Vie", hours: 0 },
      { day: "Sáb", hours: 0 },
      { day: "Dom", hours: 0 },
    ];
    
    const now = new Date();
    // Set to beginning of today
    now.setHours(0,0,0,0);
    // Find the Monday of the current week
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); 
    const monday = new Date(now);
    monday.setDate(monday.getDate() - currentDay + 1);
    
    pomodoros.forEach(p => {
      const date = new Date(p.created_at);
      if (date >= monday) {
        let dayIndex = date.getDay() - 1;
        if (dayIndex === -1) dayIndex = 6;
        data[dayIndex].hours += (p.duration || 25) / 60;
      }
    });

    return data.map(d => ({ ...d, hours: parseFloat(d.hours.toFixed(1)) }));
  };

  const weeklyData = getWeeklyData();
  const hoursThisWeek = weeklyData.reduce((acc, d) => acc + d.hours, 0);

  // Calculate Streak
  const getStreak = () => {
    if (pomodoros.length === 0) return 0;
    // Get unique dates in descending order
    const days = [...new Set(pomodoros.map(p => new Date(p.created_at).toISOString().split('T')[0]))].sort().reverse();
    let streak = 0;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let currentDateStr = todayStr;
    
    if (days.includes(todayStr)) {
      currentDateStr = todayStr;
    } else if (days.includes(yesterdayStr)) {
      currentDateStr = yesterdayStr;
    } else {
      return 0; // No activity today or yesterday
    }
    
    const currDate = new Date(currentDateStr);
    for (const day of days) {
      if (day === currDate.toISOString().split('T')[0]) {
        streak++;
        currDate.setDate(currDate.getDate() - 1);
      } else if (day > currDate.toISOString().split('T')[0]) {
        // Skip days in the future if any (timezone weirdness)
        continue;
      } else {
        break; // Streak broken
      }
    }
    return streak;
  };

  const currentStreak = getStreak();

  const projectData = [
    { name: "Trabajo", value: 50, color: "var(--primary)" },
    { name: "Estudio", value: 30, color: "var(--secondary-foreground)" },
    { name: "Otros", value: 20, color: "var(--accent)" },
  ]; // Project distribution is hard to calculate without task categories, keeping simplified static for now

  const stats = [
    {
      icon: Clock,
      label: "Horas esta semana",
      value: `${hoursThisWeek.toFixed(1)}h`,
      bg: "bg-primary/15 text-primary-foreground",
    },
    {
      icon: Target,
      label: "Pomodoros",
      value: completedPomodoros.toString(),
      bg: "bg-secondary text-secondary-foreground",
    },
    {
      icon: TrendingUp,
      label: "Días seguidos",
      value: currentStreak.toString(),
      bg: "bg-accent text-accent-foreground",
    },
    {
      icon: Award,
      label: "Productividad",
      value: `${productivity}%`,
      bg: "bg-destructive/15 text-destructive",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      {/* Header */}
      <div className="mb-8 mt-2">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Estadísticas</h1>
        <p className="text-sm text-muted-foreground">Analiza tu ritmo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 bg-card rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.trend && (
                  <div className={cn(
                    "flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    stat.trendUp ? "text-primary-foreground bg-primary/20" : "text-destructive bg-destructive/10"
                  )}>
                    {stat.trendUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <p className="text-2xl font-semibold text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Weekly Hours Chart */}
      <Card className="p-5 bg-card rounded-3xl shadow-sm border border-border/50 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-foreground">Flujo semanal</h2>
          <span className="text-xs font-medium text-muted-foreground">Últimos 7 días</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <Tooltip
              cursor={{ fill: 'var(--accent)', opacity: 0.5 }}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                fontSize: "12px",
                color: "var(--foreground)"
              }}
              itemStyle={{ color: "var(--foreground)", fontWeight: 500 }}
            />
            <Bar dataKey="hours" fill="var(--primary)" radius={[6, 6, 6, 6]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Time by Project */}
      <Card className="p-5 bg-card rounded-3xl shadow-sm border border-border/50 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-2">Distribución de energía</h2>
        <div className="flex items-center h-[180px]">
          <div className="flex-1 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-3 pl-2">
            {projectData.map((project, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <span className="text-[11px] font-medium text-foreground">
                    {project.name}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">{project.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Performance Summary */}
      <Card className="p-6 bg-primary text-primary-foreground rounded-3xl shadow-[0_8px_30px_rgba(168,195,160,0.2)] border-0 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <h3 className="text-sm font-semibold mb-4 opacity-90 tracking-wide uppercase">Resumen Global</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-primary-foreground/10 pb-3">
            <span className="text-sm font-medium opacity-90">Racha actual</span>
            <span className="text-sm font-bold">{currentStreak} días</span>
          </div>
          <div className="flex items-center justify-between border-b border-primary-foreground/10 pb-3">
            <span className="text-sm font-medium opacity-90">Pomodoros totales</span>
            <span className="text-sm font-bold">{completedPomodoros}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-90">Total concentrado</span>
            <span className="text-sm font-bold">{totalHours.toFixed(1)} horas</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
