import 'package:flutter/material.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:flutter_animate/flutter_animate.dart';

class DoroLogo extends StatelessWidget {
  final double size;
  
  const DoroLogo({super.key, this.size = 48});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [

        Container(
          width: size * 1.5,
          height: size * 1.5,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
            shape: BoxShape.circle,
            border: Border.all(
              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3),
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
                blurRadius: 15,
                spreadRadius: 2,
              )
            ]
          ),
          child: Center(
            child: Icon(
              LucideIcons.sprout,
              size: size,
              color: Theme.of(context).colorScheme.primary,
            )
            .animate(onPlay: (controller) => controller.repeat(reverse: true))
            .scale(begin: const Offset(0.9, 0.9), end: const Offset(1.1, 1.1), duration: 2.seconds, curve: Curves.easeInOut)
            .tint(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.3), duration: 2.seconds),
          ),
        )
        .animate()
        .fadeIn(duration: 600.ms)
        .slideX(begin: -0.2, end: 0, duration: 600.ms, curve: Curves.easeOutBack),
        
        SizedBox(width: size * 0.25),
        // Texto
        RichText(
          text: TextSpan(
            style: TextStyle(
              fontSize: size * 0.8, 
              fontWeight: FontWeight.w900, 
              letterSpacing: -1.5
            ),
            children: [
              TextSpan(
                text: 'Doro', 
                style: TextStyle(color: Theme.of(context).colorScheme.primary)
              ),
              TextSpan(
                text: 'App', 
                style: TextStyle(color: Theme.of(context).colorScheme.onSecondary)
              ),
            ],
          ),
        )
        .animate()
        .fadeIn(duration: 600.ms, delay: 200.ms)
        .slideX(begin: 0.2, end: 0, duration: 600.ms, curve: Curves.easeOutBack),
      ],
    );
  }
}
