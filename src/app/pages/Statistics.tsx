import { Card } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Clock, Target, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "../components/ui/utils";

export default function Statistics() {
  const weeklyData = [
    { day: "Lun", hours: 3.5 },
    { day: "Mar", hours: 4.2 },
    { day: "Mié", hours: 2.8 },
    { day: "Jue", hours: 5.1 },
    { day: "Vie", hours: 4.5 },
    { day: "Sáb", hours: 3.0 },
    { day: "Dom", hours: 2.5 },
  ];

  const projectData = [
    { name: "Trabajo", value: 35, color: "var(--primary)" },
    { name: "Estudio", value: 25, color: "var(--secondary-foreground)" },
    { name: "Lectura", value: 20, color: "var(--chart-3)" },
    { name: "Proyectos", value: 15, color: "var(--chart-5)" },
    { name: "Otros", value: 5, color: "var(--accent)" },
  ];

  const stats = [
    {
      icon: Clock,
      label: "Horas esta semana",
      value: "25.6h",
      trend: "+12%",
      trendUp: true,
      bg: "bg-primary/15 text-primary-foreground",
    },
    {
      icon: Target,
      label: "Pomodoros",
      value: "64",
      trend: "+5%",
      trendUp: true,
      bg: "bg-secondary text-secondary-foreground",
    },
    {
      icon: TrendingUp,
      label: "Días seguidos",
      value: "12",
      trend: "-2%",
      trendUp: false,
      bg: "bg-accent text-accent-foreground",
    },
    {
      icon: Award,
      label: "Productividad",
      value: "87%",
      trend: "+8%",
      trendUp: true,
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
                <div className={cn(
                  "flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  stat.trendUp ? "text-primary-foreground bg-primary/20" : "text-destructive bg-destructive/10"
                )}>
                  {stat.trendUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {stat.trend}
                </div>
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
        <h3 className="text-sm font-semibold mb-4 opacity-90 tracking-wide uppercase">Resumen del mes</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-primary-foreground/10 pb-3">
            <span className="text-sm font-medium opacity-90">Mejor racha</span>
            <span className="text-sm font-bold">18 días</span>
          </div>
          <div className="flex items-center justify-between border-b border-primary-foreground/10 pb-3">
            <span className="text-sm font-medium opacity-90">Promedio diario</span>
            <span className="text-sm font-bold">3.7 horas</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-90">Total concentrado</span>
            <span className="text-sm font-bold">76.5 horas</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
