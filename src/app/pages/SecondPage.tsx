import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Timer, ArrowLeft, Wind } from "lucide-react";

export default function SecondPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-6 font-sans flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background ambient elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-1000">
        <div className="w-20 h-20 bg-zinc-800/50 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-zinc-700/50">
          <Wind className="w-10 h-10 text-primary opacity-80" />
        </div>
        
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Enfoque Profundo</h1>
        <p className="text-zinc-400 mb-12 leading-relaxed">
          Has traído tu inspiración al espacio de trabajo. Respira profundo y prepárate para comenzar.
        </p>

        <Button
          onClick={() => navigate("/app/timer")}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_4px_20px_rgba(168,195,160,0.2)] mb-4 text-base font-medium transition-all active:scale-[0.98]"
        >
          <Timer className="w-5 h-5 mr-2" />
          Iniciar Temporizador
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="w-full h-12 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-xl text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Regresar a Inspiración
        </Button>
      </div>
    </div>
  );
}
