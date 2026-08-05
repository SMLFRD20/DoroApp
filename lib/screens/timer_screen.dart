import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'dart:async';

enum TimerMode { work, shortBreak, longBreak }

class TimerScreen extends StatefulWidget {
  final String? taskId;

  const TimerScreen({super.key, this.taskId});

  @override
  State<TimerScreen> createState() => _TimerScreenState();
}

class _TimerScreenState extends State<TimerScreen> with SingleTickerProviderStateMixin {
  TimerMode _mode = TimerMode.work;
  Map<String, dynamic>? _task;
  
  late int _timeLeft;
  int _totalTime = 25 * 60;
  bool _isRunning = false;
  Timer? _timer;
  
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _timeLeft = _getInitialTime(TimerMode.work);
    _totalTime = _timeLeft;
    
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    if (widget.taskId != null) {
      _fetchTask();
    }
  }

  @override
  void didUpdateWidget(TimerScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.taskId != oldWidget.taskId) {
      if (widget.taskId != null) {
        _fetchTask();
      } else {
        setState(() => _task = null);
      }
    }
  }

  Future<void> _fetchTask() async {
    try {
      final res = await Supabase.instance.client
          .from('tasks')
          .select('*')
          .eq('id', widget.taskId!)
          .maybeSingle();
      if (res != null && mounted) {
        setState(() => _task = res);
      }
    } catch (e) {
      debugPrint("Error fetching task: $e");
    }
  }

  int _getInitialTime(TimerMode mode) {
    switch (mode) {
      case TimerMode.work: return 25 * 60;
      case TimerMode.shortBreak: return 5 * 60;
      case TimerMode.longBreak: return 15 * 60;
    }
  }

  void _switchMode(TimerMode newMode) {
    setState(() {
      _mode = newMode;
      _timeLeft = _getInitialTime(newMode);
      _totalTime = _timeLeft;
      _isRunning = false;
      _pulseController.stop();
      _pulseController.value = 1.0;
      _timer?.cancel();
    });
  }

  void _toggleTimer() {
    setState(() {
      _isRunning = !_isRunning;
      if (_isRunning) {
        _pulseController.repeat(reverse: true);
        _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
          setState(() {
            if (_timeLeft > 0) {
              _timeLeft--;
            } else {
              _completePhase();
            }
          });
        });
      } else {
        _pulseController.stop();
        _pulseController.animateTo(1.0);
        _timer?.cancel();
      }
    });
  }

  void _resetTimer() {
    setState(() {
      _isRunning = false;
      _pulseController.stop();
      _pulseController.value = 1.0;
      _timer?.cancel();
      _timeLeft = _getInitialTime(_mode);
    });
  }

  Future<void> _completePhase() async {
    _timer?.cancel();
    _pulseController.stop();
    _pulseController.value = 1.0;
    setState(() => _isRunning = false);

    if (_mode == TimerMode.work) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: const Text("¡Pomodoro registrado! Buen trabajo."), backgroundColor: Theme.of(context).colorScheme.primary)
      );
      await _saveSessionAndCheckTask();
      _switchMode(TimerMode.shortBreak);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: const Text("Descanso terminado. ¡A enfocarse!"), backgroundColor: Theme.of(context).colorScheme.primary)
      );
      _switchMode(TimerMode.work);
    }
  }

  Future<void> _saveSessionAndCheckTask() async {
    final supabase = Supabase.instance.client;
    final user = supabase.auth.currentUser;
    if (user == null) return;

    if (widget.taskId == null || _task == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Modo libre: No hay tarea seleccionada. Pomodoro registrado."))
      );
      try {
        await supabase.from('pomodoro_sessions').insert({
          'user_id': user.id,
          'duration': 25,
          'type': 'work',
        });
      } catch (e) {
        debugPrint(e.toString());
      }
      return;
    }

    try {
      await supabase.from('pomodoro_sessions').insert({
        'task_id': widget.taskId,
        'user_id': user.id,
        'duration': 25,
        'type': 'work',
      });

      final sessionsRes = await supabase.from('pomodoro_sessions').select('id').eq('task_id', widget.taskId!).eq('type', 'work');
      final completedCount = (sessionsRes as List).length;
      final expected = _task!['expected_pomodoros'] as int? ?? 1;

      if (completedCount >= expected && _task!['is_completed'] == false) {
        await supabase.from('tasks').update({'is_completed': true}).eq('id', widget.taskId!);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("¡Felicidades! Completaste la meta de \"${_task!['title']}\"."), backgroundColor: Theme.of(context).colorScheme.secondary)
          );
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) context.go('/app/tasks');
          });
        }
      }
    } catch (e) {
      debugPrint("Error in save session: $e");
    }
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final progress = 1 - (_timeLeft / _totalTime);
    
    Color activeColor;
    String titleText;
    String subtitleText;
    
    switch (_mode) {
      case TimerMode.work:
        activeColor = Theme.of(context).colorScheme.primary;
        titleText = "Sesión de Enfoque";
        subtitleText = "Pomodoro Activo";
        break;
      case TimerMode.shortBreak:
        activeColor = Theme.of(context).colorScheme.secondary;
        titleText = "Descanso";
        subtitleText = "Descanso Corto";
        break;
      case TimerMode.longBreak:
        activeColor = Theme.of(context).colorScheme.secondaryContainer;
        titleText = "Descanso Largo";
        subtitleText = "Recuperación profunda";
        break;
    }

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Cabecera
              Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surface,
                      shape: BoxShape.circle,
                      border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                    ),
                    child: IconButton(
                      icon: const Icon(LucideIcons.arrow_left, size: 20),
                      onPressed: () => context.go('/app/tasks'),
                    ),
                  ),
                  Expanded(
                    child: Column(
                      children: [
                        Text(titleText, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                        Text(subtitleText, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.6))),
                      ],
                    ),
                  ),
                  const SizedBox(width: 48), // spacer to balance the row
                ],
              ),
              const SizedBox(height: 24),

              // Mode Selector
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(32),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _ModeButton(
                      text: 'Trabajo',
                      isSelected: _mode == TimerMode.work,
                      color: Theme.of(context).colorScheme.primary,
                      onTap: () => _switchMode(TimerMode.work),
                    ),
                    _ModeButton(
                      text: 'Corto',
                      isSelected: _mode == TimerMode.shortBreak,
                      color: Theme.of(context).colorScheme.secondary,
                      onTap: () => _switchMode(TimerMode.shortBreak),
                    ),
                    _ModeButton(
                      text: 'Largo',
                      isSelected: _mode == TimerMode.longBreak,
                      color: Theme.of(context).colorScheme.secondaryContainer,
                      onTap: () => _switchMode(TimerMode.longBreak),
                    ),
                  ],
                ),
              ),
              
              const Spacer(),
              
              AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _isRunning ? _pulseAnimation.value : 1.0,
                    child: child,
                  );
                },
                child: Container(
                  width: 280,
                  height: 280,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: activeColor.withValues(alpha: 0.15),
                        blurRadius: 60,
                        spreadRadius: 10,
                      )
                    ],
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 260,
                        height: 260,
                        child: CircularProgressIndicator(
                          value: progress,
                          strokeWidth: 12,
                          backgroundColor: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.3),
                          color: activeColor,
                          strokeCap: StrokeCap.round,
                        ),
                      ),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            _formatTime(_timeLeft),
                            style: const TextStyle(fontSize: 64, fontWeight: FontWeight.w300, letterSpacing: -2),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                            decoration: BoxDecoration(
                              color: _isRunning ? activeColor.withValues(alpha: 0.1) : Colors.transparent,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _isRunning 
                                ? (_mode == TimerMode.work ? "Enfocado..." : "Relajando...") 
                                : "En pausa",
                              style: TextStyle(
                                fontSize: 14, 
                                fontWeight: FontWeight.w500, 
                                color: _isRunning ? activeColor : Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.5)
                              ),
                            ),
                          )
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              
              const Spacer(),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surface,
                      shape: BoxShape.circle,
                      border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                    ),
                    child: IconButton(
                      onPressed: _resetTimer,
                      icon: Icon(LucideIcons.rotate_ccw, color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.7)),
                    ),
                  ),
                  const SizedBox(width: 24),
                  GestureDetector(
                    onTap: _toggleTimer,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: activeColor,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: activeColor.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8))
                        ],
                      ),
                      child: Icon(
                        _isRunning ? LucideIcons.pause : LucideIcons.play,
                        color: Colors.white,
                        size: 32,
                      ),
                    ),
                  ),
                  const SizedBox(width: 24),
                  const SizedBox(width: 56), // spacer for balance
                ],
              ),
              
              const SizedBox(height: 32),
              
              // Quick Stats / Task info at bottom
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                      ),
                      child: Column(
                        children: [
                          Icon(LucideIcons.target, size: 20, color: Theme.of(context).colorScheme.primary),
                          const SizedBox(height: 8),
                          const Text("Tarea actual", style: TextStyle(fontSize: 12, color: Colors.grey)),
                          const SizedBox(height: 2),
                          Text(_task?['title'] ?? 'Sin tarea seleccionada', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: GestureDetector(
                      onTap: _completePhase,
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: activeColor,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [BoxShadow(color: activeColor.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))],
                        ),
                        child: Column(
                          children: [
                            const Icon(LucideIcons.coffee, size: 20, color: Colors.white),
                            const SizedBox(height: 8),
                            const Text("Siguiente fase", style: TextStyle(fontSize: 12, color: Colors.white70)),
                            const SizedBox(height: 2),
                            Text(_mode == TimerMode.work ? 'Saltar a Descanso' : 'Saltar a Trabajo', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ModeButton extends StatelessWidget {
  final String text;
  final bool isSelected;
  final Color color;
  final VoidCallback onTap;

  const _ModeButton({required this.text, required this.isSelected, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? color : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected ? Colors.white : Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.7),
          ),
        ),
      ),
    );
  }
}
