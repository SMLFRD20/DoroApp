import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Sprout } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const navigate = useNavigate();
  const { session } = useAuth();
  
  useEffect(() => {
    if (session) {
      navigate("/app");
    }
  }, [session, navigate]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            date_of_birth: birthDate,
          }
        }
      });
      
      if (error) throw error;
      toast.success("¡Cuenta creada con éxito!");
      navigate("/app");
    } catch (error: any) {
      toast.error(error.message || "Ha ocurrido un error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-[390px] mx-auto font-sans relative overflow-hidden shadow-2xl overflow-y-auto">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-secondary/30 rounded-full blur-[60px] pointer-events-none"></div>

      {/* Header with Logo */}
      <div className="flex flex-col items-center justify-center pt-16 pb-6 relative z-10">
        <div className="w-20 h-20 bg-card border border-border/50 rounded-full flex items-center justify-center shadow-lg mb-4 relative group overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
          <Sprout className="w-10 h-10 text-primary relative z-10" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2">Crear Cuenta</h1>
        <p className="text-sm text-muted-foreground text-center px-10 leading-relaxed font-medium">
          Únete a DoroApp y encuentra tu ritmo.
        </p>
      </div>

      {/* SignUp Form */}
      <div className="flex-1 px-8 pb-10 relative z-10">
        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Nombre</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-12 rounded-xl bg-card border-border/50 px-4 focus:ring-primary focus:border-primary shadow-sm text-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Apellido</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="h-12 rounded-xl bg-card border-border/50 px-4 focus:ring-primary focus:border-primary shadow-sm text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Fecha de Nacimiento</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="h-12 rounded-xl bg-card border-border/50 px-4 focus:ring-primary focus:border-primary shadow-sm text-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl bg-card border-border/50 px-4 focus:ring-primary focus:border-primary shadow-sm text-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 rounded-xl bg-card border-border/50 px-4 focus:ring-primary focus:border-primary shadow-sm text-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 rounded-xl bg-card border-border/50 px-4 focus:ring-primary focus:border-primary shadow-sm text-sm transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-[0_8px_20px_rgba(168,195,160,0.4)] text-base font-medium transition-all active:scale-[0.98] mt-6"
          >
            {loading ? "Creando cuenta..." : "Plantar nueva semilla"}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm font-medium text-muted-foreground">
              ¿Ya tienes una semilla?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
