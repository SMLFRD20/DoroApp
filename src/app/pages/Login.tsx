import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Sprout } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/app");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-[390px] mx-auto font-sans relative overflow-hidden shadow-2xl">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-secondary/30 rounded-full blur-[60px] pointer-events-none"></div>

      {/* Header with Logo */}
      <div className="flex flex-col items-center justify-center pt-24 pb-12 relative z-10">
        <div className="w-24 h-24 bg-card border border-border/50 rounded-full flex items-center justify-center shadow-lg mb-6 relative group overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
          <Sprout className="w-12 h-12 text-primary relative z-10" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-3">DoroApp</h1>
        <p className="text-sm text-muted-foreground text-center px-10 leading-relaxed font-medium">
          Encuentra tu ritmo natural.<br/>Mejora tu enfoque con calma.
        </p>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-8 relative z-10">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl bg-card border-border/50 px-4 focus:ring-primary focus:border-primary shadow-sm text-base transition-all"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl bg-card border-border/50 px-4 focus:ring-primary focus:border-primary shadow-sm text-base transition-all"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_8px_20px_rgba(168,195,160,0.4)] text-base font-medium transition-all active:scale-[0.98] mt-4"
          >
            Entrar al flujo
          </Button>

          <div className="text-center -pt-10
          ">
            <p className="text-sm font-medium text-muted-foreground -m-[5px]">
              ¿Nueva semilla?{" "}
              <button
                type="button"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Crear cuenta
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Decorative Elements */}
      <div className="px-6 pb-10 text-center relative z-10 mt-8">
        <div className="flex items-center justify-center space-x-6 text-muted-foreground text-xs font-medium tracking-wide">
          <span className="flex items-center gap-1"><span className="text-primary">●</span> Calma</span>
          <span className="flex items-center gap-1"><span className="text-secondary-foreground">●</span> Enfoque</span>
          <span className="flex items-center gap-1"><span className="text-destructive">●</span> Progreso</span>
        </div>
      </div>
    </div>
  );
}
