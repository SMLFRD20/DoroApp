import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:math' as math;

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  String _firstName = "Semilla";
  String? _avatarUrl;
  int _completedTasks = 0;
  int _totalTasks = 0;
  int _currentPomodoros = 0;
  Map<String, dynamic>? _nextTask;
  String _quoteContent = "La naturaleza no se apresura, sin embargo todo se logra.";
  String _quoteAuthor = "Lao Tsé";
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
    _fetchQuote();
  }

  Future<void> _fetchQuote() async {
    try {
      final response = await http.get(Uri.parse('https://dummyjson.com/quotes/random'));
      if (response.statusCode == 200) {
        final data = json.decode(utf8.decode(response.bodyBytes));
        if (mounted) {
          setState(() {
            _quoteContent = data['quote'];
            _quoteAuthor = data['author'];
          });
        }
      }
    } catch (e) {
      debugPrint("Error fetching quote: $e");
    }
  }

  Future<void> _fetchData() async {
    try {
      final supabase = Supabase.instance.client;
      final user = supabase.auth.currentUser;
      if (user != null) {
        final metaName = user.userMetadata?['first_name'];
        final metaAvatar = user.userMetadata?['avatar_url'];
        if (metaName != null) {
          _firstName = metaName;
        } else if (user.email != null) {
          _firstName = user.email!.split('@')[0];
        }
        if (metaAvatar != null) {
          _avatarUrl = metaAvatar;
        }
        // Tareas
        final tasksRes = await supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', ascending: false);
        final tasks = List<Map<String, dynamic>>.from(tasksRes);
        
        final pending = tasks.where((t) => t['is_completed'] == false).toList();
        final completed = tasks.where((t) => t['is_completed'] == true).toList();
        // Pomodoros
        final now = DateTime.now();

        final startOfDay = DateTime(now.year, now.month, now.day).toUtc().toIso8601String();
        
        final pomodorosRes = await supabase
            .from('pomodoro_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'work')
            .gte('created_at', startOfDay);
            
        if (mounted) {
          setState(() {
            _totalTasks = tasks.length;
            _completedTasks = completed.length;
            _currentPomodoros = (pomodorosRes as List).length;
            if (pending.isNotEmpty) {
              _nextTask = pending.first;
            }
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint("Error fetching dashboard data: $e");
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    const int totalPomodorosGoal = 8;
    final double progressPercent = math.min(_currentPomodoros / totalPomodorosGoal, 1.0);
    final int productivity = _totalTasks > 0 ? ((_completedTasks / _totalTasks) * 100).round() : 0;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cabecera
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('¡Buenos días, $_firstName!', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w600, letterSpacing: -0.5)),
                      const SizedBox(height: 4),
                      Text('Encuentra tu ritmo hoy', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.6), fontSize: 14)),
                    ],
                  ),
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                      border: Border.all(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.2), width: 2),
                      image: _avatarUrl != null ? DecorationImage(image: NetworkImage(_avatarUrl!), fit: BoxFit.cover) : null,
                    ),
                    child: _avatarUrl == null 
                        ? Center(
                            child: Text(_firstName.isNotEmpty ? _firstName[0].toUpperCase() : 'S', 
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Theme.of(context).colorScheme.primary)),
                          )
                        : null,
                  ),
                ],
              ),
              const SizedBox(height: 32),
              // Tarjeta de Inspiración
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8))
                  ],
                  image: const DecorationImage(
                    image: NetworkImage("https://images.unsplash.com/photo-1606820049560-cfaa8cba5859?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"),
                    fit: BoxFit.cover,
                    colorFilter: ColorFilter.mode(Colors.black12, BlendMode.darken),
                    opacity: 0.3,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(LucideIcons.sprout, color: Theme.of(context).colorScheme.onPrimary.withValues(alpha: 0.9), size: 18),
                        const SizedBox(width: 8),
                        Text('INSPIRACIÓN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onPrimary.withValues(alpha: 0.9), letterSpacing: 1.0)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '"$_quoteContent"',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Theme.of(context).colorScheme.onPrimary, height: 1.4),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'â€” $_quoteAuthor',
                      style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onPrimary.withValues(alpha: 0.7)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Daily Goal
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(LucideIcons.target, size: 16, color: Theme.of(context).colorScheme.primary),
                      const SizedBox(width: 8),
                      const Text('Objetivo Diario', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  Text('$_currentPomodoros/$totalPomodorosGoal Pomodoros', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey)),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                ),
                child: Column(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: progressPercent,
                        minHeight: 10,
                        backgroundColor: Theme.of(context).colorScheme.secondary,
                        valueColor: AlwaysStoppedAnimation<Color>(Theme.of(context).colorScheme.primary),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('En progreso', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        Text('${(progressPercent * 100).round()}% completado', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Grid Summary
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 160,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(LucideIcons.timer, color: Theme.of(context).colorScheme.primary, size: 20),
                          ),
                          const Spacer(),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text('${_currentPomodoros * 25}', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w600)),
                              const SizedBox(width: 4),
                              const Text('min', style: TextStyle(fontSize: 16, color: Colors.grey)),
                            ],
                          ),
                          const Text('Tiempo de enfoque', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: SizedBox(
                      height: 160,
                      child: Column(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.surface,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))],
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).colorScheme.secondary,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Icon(LucideIcons.circle_check, color: Theme.of(context).colorScheme.onSecondary, size: 20),
                                  ),
                                  const SizedBox(width: 12),
                                  Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('$_completedTasks', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
                                      const Text('Tareas listas', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Colors.grey)),
                                    ],
                                  )
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.surface,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))],
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).colorScheme.error.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Icon(LucideIcons.trending_up, color: Theme.of(context).colorScheme.error, size: 20),
                                  ),
                                  const SizedBox(width: 12),
                                  Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('$productivity%', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
                                      const Text('Productividad', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Colors.grey)),
                                    ],
                                  )
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Start Action
              ElevatedButton.icon(
                onPressed: () => context.go('/app/timer'),
                icon: const Icon(LucideIcons.timer, size: 24),
                label: const Text('Iniciar Enfoque', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 64),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 8,
                  shadowColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.5),
                ),
              ),
              const SizedBox(height: 32),

              // Next Task
              const Text('Siguiente en la agenda', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(_nextTask != null ? LucideIcons.target : LucideIcons.coffee, size: 16, color: Theme.of(context).colorScheme.onSecondary),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_nextTask != null ? _nextTask!['title'] : "Tómate un descanso", style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 2),
                          Text(_nextTask != null ? "Estimado: ${_nextTask!['expected_pomodoros'] ?? 1} pomodoros" : "No hay tareas activas", style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: () => _nextTask != null ? context.go('/app/timer?taskId=${_nextTask!['id']}') : context.go('/app/tasks'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.surface,
                        foregroundColor: Theme.of(context).textTheme.bodyMedium?.color,
                        elevation: 2,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      child: Text(_nextTask != null ? 'Iniciar' : 'Ver Tareas', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
            ].animate(interval: 50.ms).fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0, duration: 400.ms, curve: Curves.easeOutQuad),
          ),
        ),
      ),
    );
  }
}
