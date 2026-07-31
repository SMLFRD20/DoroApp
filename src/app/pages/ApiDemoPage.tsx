import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ApiService } from "../services/apiService";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Quote, Sprout, ArrowRight } from "lucide-react";

export default function ApiDemoPage() {
  const [quote, setQuote] = useState<{ quote: string; author: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Usamos dummyjson para obtener una cita aleatoria
    const apiService = new ApiService("https://dummyjson.com");
    
    apiService.fetchData()
      .then((responseData) => {
        setQuote({ quote: responseData.quote, author: responseData.author });
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 font-sans flex flex-col justify-center max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Inspiración Diaria</h1>
        <p className="text-sm text-muted-foreground">Una semilla para tu enfoque de hoy</p>
      </div>

      <Card className="relative overflow-hidden bg-primary text-primary-foreground p-8 rounded-3xl shadow-[0_8px_30px_rgba(168,195,160,0.3)] border-0 mb-8 min-h-[250px] flex flex-col justify-center">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="w-5 h-5 opacity-90" />
            <span className="text-xs font-medium uppercase tracking-wider opacity-90">Palabras de Sabiduría</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-foreground mb-4"></div>
              <p className="text-sm opacity-80">Buscando inspiración...</p>
            </div>
          ) : error ? (
            <div className="py-6">
              <p className="text-lg font-medium leading-relaxed mb-1">Ups, la conexión se interrumpió.</p>
              <p className="text-sm opacity-75">{error}</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Quote className="w-8 h-8 opacity-20 absolute -top-2 -left-2" />
              <p className="text-xl md:text-2xl font-medium leading-relaxed mb-4 relative z-10">
                "{quote?.quote}"
              </p>
              <p className="text-sm opacity-90 font-medium">— {quote?.author}</p>
            </div>
          )}
        </div>
        
        {/* Fondo decorativo (hojas) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1606820049560-cfaa8cba5859?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Boho Leaves" className="w-full h-full object-cover mix-blend-overlay" />
        </div>
      </Card>

      <Button
        onClick={() => navigate("/app/second-page")}
        disabled={isLoading || !!error}
        className="w-full h-16 bg-card text-foreground border border-border/50 hover:bg-accent rounded-2xl shadow-sm mb-4 text-base font-medium transition-all duration-300 active:scale-[0.98]"
      >
        Llevar inspiración al enfoque
        <ArrowRight className="w-5 h-5 ml-2 text-muted-foreground" />
      </Button>
      
      <Button
        variant="ghost"
        onClick={() => navigate("/app")}
        className="w-full h-12 text-muted-foreground hover:text-foreground rounded-xl text-sm"
      >
        Volver al inicio
      </Button>
    </div>
  );
}
