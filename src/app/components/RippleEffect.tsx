import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function RippleEffect() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Evitar crear ondas en botones que ya tienen su propio active state
      // pero para dar la sensación táctil global en la app, podemos aplicarlo a todo.
      const newRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation completes (approx 600ms)
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 800);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ 
              scale: 0, 
              opacity: 0.5,
              x: "-50%",
              y: "-50%",
              top: ripple.y,
              left: ripple.x
            }}
            animate={{ 
              scale: 3, 
              opacity: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeOut"
            }}
            className="absolute rounded-full bg-primary/30 border border-primary/20"
            style={{ 
              width: 80, 
              height: 80 
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
