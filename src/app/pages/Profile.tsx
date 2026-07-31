import image_imagen_2026_06_26_140104119 from '@/imports/imagen_2026-06-26_140104119.png'
import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { User, Bell, Moon, Timer, Coffee, LogOut, ChevronRight, Shield, Award, Sprout } from "lucide-react";
import { cn } from "../components/ui/utils";

export default function Profile() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      {/* Header */}
      <div className="mb-8 mt-2">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Tu Espacio</h1>
        <p className="text-sm text-muted-foreground">Configura tu entorno ideal</p>
      </div>

      {/* User Info Card */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-4">
          <Avatar className="w-28 h-28 border-4 border-card shadow-lg">
            <AvatarImage src={image_imagen_2026_06_26_140104119} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-medium">
              S
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-card rounded-full flex items-center justify-center border-2 border-background shadow-sm">
            <div className="w-5 h-5 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
               <Award className="w-3 h-3" />
            </div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Sergio</h2>
        <p className="text-sm text-muted-foreground mb-3">sergio@email.com</p>
        <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wide">
          Enfoque Zen
        </span>
      </div>

      {/* Pomodoro Settings */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">Ciclo de Concentración</h3>
        
        <div className="space-y-3">
          <Card className="p-4 bg-card rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Timer className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-0.5">Duración Pomodoro</p>
                  <p className="text-xs text-muted-foreground">25 minutos</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </div>
          </Card>

          <Card className="p-4 bg-card rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Coffee className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-0.5">Descanso corto</p>
                  <p className="text-xs text-muted-foreground">5 minutos</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </div>
          </Card>

          <Card className="p-4 bg-card rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Coffee className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-0.5">Descanso largo</p>
                  <p className="text-xs text-muted-foreground">15 minutos (cada 4 ciclos)</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </div>
          </Card>
        </div>
      </div>

      {/* App Settings */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">Preferencias</h3>

        <div className="space-y-3">
          <Card className="p-4 bg-card rounded-3xl shadow-sm border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-card border border-border/50 rounded-2xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <Label htmlFor="notifications" className="font-medium text-foreground cursor-pointer mb-0.5 block">
                    Notificaciones
                  </Label>
                  <p className="text-xs text-muted-foreground">Alertas suaves de tiempo</p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </Card>

          <Card className="p-4 bg-card rounded-3xl shadow-sm border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-card border border-border/50 rounded-2xl flex items-center justify-center">
                  <Moon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <Label htmlFor="darkMode" className="font-medium text-foreground cursor-pointer mb-0.5 block">
                    Modo nocturno
                  </Label>
                  <p className="text-xs text-muted-foreground">Para entornos de baja luz</p>
                </div>
              </div>
              <Switch
                id="darkMode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Account Actions */}
      <div className="mb-12">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">Cuenta</h3>

        <div className="space-y-3 mb-6">
          <Card className="p-4 bg-card rounded-3xl shadow-sm border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-foreground" />
                </div>
                <p className="font-medium text-foreground">Editar perfil</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
            </div>
          </Card>
          
          <Card className="p-4 bg-card rounded-3xl shadow-sm border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-foreground" />
                </div>
                <p className="font-medium text-foreground">Privacidad y seguridad</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
            </div>
          </Card>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-14 rounded-2xl border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/50 transition-all font-medium"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Cerrar sesión
        </Button>
      </div>

      {/* App Info */}
      <div className="text-center pb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
           <Sprout className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">DoroApp</p>
        <p className="text-xs text-muted-foreground mt-1 mb-2">Versión 1.0.0</p>
        <p className="text-xs text-muted-foreground/70">Diseñado con calma para tu enfoque</p>
      </div>
    </div>
  );
}