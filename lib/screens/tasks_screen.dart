import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  List<Map<String, dynamic>> _tasks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTasks();
  }

  Future<void> _fetchTasks() async {
    try {
      final supabase = Supabase.instance.client;
      final user = supabase.auth.currentUser;
      if (user != null) {
        final res = await supabase
            .from('tasks')
            .select('*, pomodoro_sessions(id)')
            .eq('user_id', user.id)
            .order('created_at', ascending: false);
        if (mounted) {
          setState(() {
            _tasks = List<Map<String, dynamic>>.from(res).map((t) {
              final sessions = t['pomodoro_sessions'] as List?;
              t['completed_count'] = sessions?.length ?? 0;
              return t;
            }).toList();
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint("Error fetching tasks: $e");
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleTask(String id, bool currentStatus) async {
    try {
      await Supabase.instance.client.from('tasks').update({'is_completed': !currentStatus}).eq('id', id);
      _fetchTasks();
    } catch (e) {
      debugPrint("Error toggling task: $e");
    }
  }

  Future<void> _deleteTask(String id) async {
    try {
      await Supabase.instance.client.from('tasks').delete().eq('id', id);
      _fetchTasks();
    } catch (e) {
      debugPrint("Error deleting task: $e");
    }
  }

  void _showAddTaskModal() {
    showDialog(
      context: context,
      builder: (context) => _AddTaskModal(onTaskAdded: _fetchTasks),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pendingTasks = _tasks.where((t) => t['is_completed'] == false).toList();
    final completedTasks = _tasks.where((t) => t['is_completed'] == true).toList();

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddTaskModal,
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        child: const Icon(LucideIcons.plus),
      ),
      body: SafeArea(
        child: Column(
          children: [
              // Cabecera
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Tu Enfoque', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w600, letterSpacing: -0.5)),
                  const SizedBox(height: 4),
                  Text('${pendingTasks.length} semillas por plantar · ${completedTasks.length} florecidas',
                      style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.6), fontSize: 14)),
                  const SizedBox(height: 24),
                  // Resumen Summary Cards
                  Row(
                    children: [
                      Expanded(
                        child: _SummaryCard(title: 'Total', value: '${_tasks.length}', color: Theme.of(context).textTheme.bodyMedium?.color),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _SummaryCard(title: 'Activas', value: '${pendingTasks.length}', color: Theme.of(context).colorScheme.error),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _SummaryCard(title: 'Hechas', value: '${completedTasks.length}', color: Theme.of(context).colorScheme.primary),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _tasks.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 96,
                                height: 96,
                                decoration: BoxDecoration(
                                  color: Theme.of(context).colorScheme.surface,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                                ),
                                child: Center(child: Icon(LucideIcons.sprout, size: 48, color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.2))),
                              ),
                              const SizedBox(height: 24),
                              const Text('Tu jardín está vacío', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 8),
                              Text('Planta tu primera semilla tocando\nel botón flotante abajo.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.5), fontSize: 14)),
                            ],
                          ),
                        )
                      : ListView(
                          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
                          children: [
                            if (pendingTasks.isNotEmpty) ...[
                              const Padding(
                                padding: EdgeInsets.only(left: 4, bottom: 16),
                                child: Text('EN CRECIMIENTO', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: Colors.grey)),
                              ),
                              ...pendingTasks.map((t) => _TaskItem(
                                    task: t,
                                    onToggle: () => _toggleTask(t['id'], false),
                                    onDelete: () => _deleteTask(t['id']),
                                  )),
                              const SizedBox(height: 16),
                            ],
                            if (completedTasks.isNotEmpty) ...[
                              const Padding(
                                padding: EdgeInsets.only(left: 4, bottom: 16, top: 8),
                                child: Text('COMPLETADAS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: Colors.grey)),
                              ),
                              ...completedTasks.map((t) => _TaskItem(
                                    task: t,
                                    onToggle: () => _toggleTask(t['id'], true),
                                    onDelete: () => _deleteTask(t['id']),
                                    isCompact: true,
                                  )),
                            ]
                          ].animate(interval: 50.ms).fadeIn(duration: 300.ms).slideX(begin: 0.1, end: 0, duration: 300.ms, curve: Curves.easeOutQuad),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final Color? color;

  const _SummaryCard({required this.title, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: color)),
          const SizedBox(height: 4),
          Text(title.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 1.0, color: Colors.grey)),
        ],
      ),
    );
  }
}

class _TaskItem extends StatelessWidget {
  final Map<String, dynamic> task;
  final VoidCallback onToggle;
  final VoidCallback onDelete;
  final bool isCompact;

  const _TaskItem({required this.task, required this.onToggle, required this.onDelete, this.isCompact = false});

  @override
  Widget build(BuildContext context) {

    final expected = task['expected_pomodoros'] ?? 1;

    if (isCompact) {
      return Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            GestureDetector(
              onTap: onToggle,
              child: const Icon(LucideIcons.check, size: 20, color: Colors.grey),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(task['title'], style: const TextStyle(fontSize: 14, color: Colors.grey, decoration: TextDecoration.lineThrough)),
            ),
            GestureDetector(
              onTap: onDelete,
              child: const Icon(LucideIcons.trash_2, size: 16, color: Colors.grey),
            )
          ],
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: onToggle,
                child: Container(
                  width: 24,
                  height: 24,
                  margin: const EdgeInsets.only(top: 2),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Theme.of(context).colorScheme.secondary),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(task['title'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, height: 1.2)),
                    if (task['description'] != null && task['description'].toString().isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(task['description'], style: TextStyle(fontSize: 12, color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.6))),
                    ]
                  ],
                ),
              ),
              GestureDetector(
                onTap: onDelete,
                child: Icon(LucideIcons.trash_2, size: 18, color: Theme.of(context).colorScheme.error.withValues(alpha: 0.7)),
              )
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, thickness: 1),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(LucideIcons.timer, size: 12, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 4),
                    Text('${task['completed_count'] ?? 0}/$expected', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: () => context.go('/app/timer?taskId=${task['id']}'),
                icon: const Icon(LucideIcons.play, size: 14),
                label: const Text('Enfocarse', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  minimumSize: Size.zero,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
              )
            ],
          )
        ],
      ),
    );
  }
}

class _AddTaskModal extends StatefulWidget {
  final VoidCallback onTaskAdded;

  const _AddTaskModal({required this.onTaskAdded});

  @override
  State<_AddTaskModal> createState() => _AddTaskModalState();
}

class _AddTaskModalState extends State<_AddTaskModal> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  int _pomodoros = 1;
  bool _isLoading = false;

  Future<void> _submit() async {
    if (_titleController.text.trim().isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final supabase = Supabase.instance.client;
      final user = supabase.auth.currentUser;
      if (user != null) {
        await supabase.from('tasks').insert({
          'user_id': user.id,
          'title': _titleController.text.trim(),
          'description': _descController.text.trim(),
          'expected_pomodoros': _pomodoros,
        });
        widget.onTaskAdded();
        if (mounted) Navigator.pop(context);
      }
    } catch (e) {
      debugPrint("Error creating task: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      insetPadding: const EdgeInsets.all(24),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Plantar nueva semilla', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, letterSpacing: -0.5)),
            const SizedBox(height: 8),
            Text('Agrega una tarea nueva y estima cuántos pomodoros te tomará.', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.6), fontSize: 13)),
            const SizedBox(height: 24),

            const Text('TÍTULO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0)),
            const SizedBox(height: 8),
            TextField(
              controller: _titleController,
              decoration: InputDecoration(
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5))),
              ),
            ),
            const SizedBox(height: 16),

            const Text('DESCRIPCIÓN (OPCIONAL)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0)),
            const SizedBox(height: 8),
            TextField(
              controller: _descController,
              decoration: InputDecoration(
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5))),
              ),
            ),
            const SizedBox(height: 16),

            Text('POMODOROS ESTIMADOS ($_pomodoros ciclos)', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1.0)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Slider(
                    value: _pomodoros.toDouble(),
                    min: 1,
                    max: 10,
                    divisions: 9,
                    label: _pomodoros.toString(),
                    onChanged: (val) => setState(() => _pomodoros = val.toInt()),
                    activeColor: Theme.of(context).colorScheme.primary,
                  ),
                ),
                Text('$_pomodoros', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 32),

            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: _isLoading ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Plantar semilla', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            )
          ],
        ),
      ),
    );
  }
}
