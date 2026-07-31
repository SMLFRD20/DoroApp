import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, CheckSquare, BarChart3, User } from "lucide-react";
import { cn } from "./ui/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/");
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }


  const navItems = [
    { path: "/app", label: "Inicio", icon: Home },
    { path: "/app/tasks", label: "Tareas", icon: CheckSquare },
    { path: "/app/statistics", label: "Estadísticas", icon: BarChart3 },
    { path: "/app/profile", label: "Perfil", icon: User },
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-[390px] mx-auto relative overflow-hidden font-sans shadow-2xl">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24 scroll-smooth overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border/40 shadow-[0_-8px_30px_rgba(78,107,74,0.06)] rounded-t-3xl z-50">
        <div className="flex items-center justify-around px-2 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/app/tasks' && location.pathname.startsWith('/app/tasks')) || (item.path === '/app/statistics' && location.pathname.startsWith('/app/statistics')) || (item.path === '/app/profile' && location.pathname.startsWith('/app/profile'));
            // special check for dashboard
            const isDashboard = item.path === '/app' && (location.pathname === '/app' || location.pathname === '/app/timer');
            const finalIsActive = isDashboard || isActive;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[64px] transition-all duration-300 gap-1",
                  finalIsActive ? "text-primary" : "text-muted-foreground hover:text-secondary-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300", 
                  finalIsActive ? "bg-primary/10 scale-110" : "bg-transparent scale-100"
                )}>
                  <Icon className={cn("w-6 h-6", finalIsActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium tracking-wide transition-all", 
                  finalIsActive ? "opacity-100 font-semibold" : "opacity-70"
                )}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
