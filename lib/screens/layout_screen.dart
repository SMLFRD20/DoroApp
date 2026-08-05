import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_lucide/flutter_lucide.dart';

class LayoutScreen extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const LayoutScreen({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, -5))
          ],
        ),
        child: NavigationBar(
          backgroundColor: Theme.of(context).colorScheme.surface,
          elevation: 0,
          indicatorColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2),
          selectedIndex: navigationShell.currentIndex,
          onDestinationSelected: (index) {
            navigationShell.goBranch(
              index,
              initialLocation: index == navigationShell.currentIndex,
            );
          },
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Inicio'),
            NavigationDestination(icon: Icon(LucideIcons.timer), label: 'Enfoque'),
            NavigationDestination(icon: Icon(Icons.list_alt), label: 'Tareas'),
            NavigationDestination(icon: Icon(Icons.bar_chart), label: 'Progreso'),
            NavigationDestination(icon: Icon(LucideIcons.user), label: 'Perfil'),
          ],
        ),
      ),
    );
  }
}
