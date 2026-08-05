import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';

class StatisticsScreen extends StatefulWidget {
  const StatisticsScreen({super.key});

  @override
  State<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends State<StatisticsScreen> {
  int _completedTasksCount = 0;
  int _totalTasksCount = 0;
  List<Map<String, dynamic>> _pomodoros = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final supabase = Supabase.instance.client;
      final user = supabase.auth.currentUser;
      if (user != null) {
        final tasksRes = await supabase.from('tasks').select('*').eq('user_id', user.id);
        final pomodorosRes = await supabase.from('pomodoro_sessions').select('*').eq('user_id', user.id).eq('type', 'work');

        if (mounted) {
          setState(() {
            final tasks = List<Map<String, dynamic>>.from(tasksRes);
            _totalTasksCount = tasks.length;
            _completedTasksCount = tasks.where((t) => t['is_completed'] == true).length;
            _pomodoros = List<Map<String, dynamic>>.from(pomodorosRes);
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint("Error fetching statistics: $e");
      if (mounted) setState(() => _isLoading = false);
    }
  }

  int _calculateStreak() {
    if (_pomodoros.isEmpty) return 0;

    final dates = _pomodoros.map((p) {
      final dt = DateTime.parse(p['created_at']).toLocal();
      return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
    }).toSet().toList();

    dates.sort((a, b) => b.compareTo(a));
    
    int streak = 0;
    final today = DateTime.now();
    final yesterday = today.subtract(const Duration(days: 1));
    
    final todayStr = '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
    final yesterdayStr = '${yesterday.year}-${yesterday.month.toString().padLeft(2, '0')}-${yesterday.day.toString().padLeft(2, '0')}';
    
    String currentDateStr = todayStr;
    if (dates.contains(todayStr)) {
      currentDateStr = todayStr;
    } else if (dates.contains(yesterdayStr)) {
      currentDateStr = yesterdayStr;
    } else {
      return 0; // No activity today or yesterday
    }
    
    DateTime currDate = DateTime.parse(currentDateStr);
    for (final dayStr in dates) {
      final checkStr = '${currDate.year}-${currDate.month.toString().padLeft(2, '0')}-${currDate.day.toString().padLeft(2, '0')}';
      if (dayStr == checkStr) {
        streak++;
        currDate = currDate.subtract(const Duration(days: 1));
      } else if (dayStr.compareTo(checkStr) > 0) {
        continue;
      } else {
        break;
      }
    }
    
    return streak;
  }

  List<double> _getWeeklyData() {
    final data = List.filled(7, 0.0);
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    
    // Get Monday of current week
    int currentDay = today.weekday; // 1 = Monday, 7 = Sunday
    final monday = today.subtract(Duration(days: currentDay - 1));
    
    for (var p in _pomodoros) {
      final date = DateTime.parse(p['created_at']).toLocal();
      if (date.isAfter(monday) || date.isAtSameMomentAs(monday)) {
        int dayIndex = date.weekday - 1; // 0 = Monday, 6 = Sunday
        data[dayIndex] += ((p['duration'] ?? 25) as num) / 60.0;
      }
    }
    return data;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final productivity = _totalTasksCount > 0 ? ((_completedTasksCount / _totalTasksCount) * 100).round() : 0;
    final totalHours = _pomodoros.fold<double>(0, (sum, item) => sum + ((item['duration'] ?? 25) as num)) / 60.0;
    final currentStreak = _calculateStreak();
    final weeklyData = _getWeeklyData();
    final hoursThisWeek = weeklyData.reduce((a, b) => a + b);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Estadísticas', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, letterSpacing: -0.5)),
              const SizedBox(height: 4),
              Text('Analiza tu ritmo', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.6), fontSize: 14)),
              const SizedBox(height: 32),

              // Stats Grid
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      icon: LucideIcons.clock,
                      label: 'Horas esta semana',
                      value: '${hoursThisWeek.toStringAsFixed(1)}h',
                      color: Theme.of(context).colorScheme.primary,
                      bgColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.15),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _StatCard(
                      icon: LucideIcons.target,
                      label: 'Pomodoros',
                      value: '${_pomodoros.length}',
                      color: Theme.of(context).colorScheme.onSecondary,
                      bgColor: Theme.of(context).colorScheme.secondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      icon: LucideIcons.trending_up,
                      label: 'Días seguidos',
                      value: '$currentStreak',
                      color: Theme.of(context).colorScheme.onSecondaryContainer,
                      bgColor: Theme.of(context).colorScheme.secondaryContainer,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _StatCard(
                      icon: LucideIcons.award,
                      label: 'Productividad',
                      value: '$productivity%',
                      color: Theme.of(context).colorScheme.error,
                      bgColor: Theme.of(context).colorScheme.error.withValues(alpha: 0.15),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Weekly Flow Chart
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Flujo semanal', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        Text('Últimos 7 días', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.5))),
                      ],
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      height: 180,
                      child: BarChart(
                        BarChartData(
                          alignment: BarChartAlignment.spaceAround,
                          maxY: weeklyData.reduce((a, b) => a > b ? a : b) > 0 ? (weeklyData.reduce((a, b) => a > b ? a : b) * 1.2) : 5,
                          barTouchData: BarTouchData(enabled: false),
                          titlesData: FlTitlesData(
                            show: true,
                            bottomTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                getTitlesWidget: (value, meta) {
                                  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 8.0),
                                    child: Text(days[value.toInt()], style: TextStyle(fontSize: 10, color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.5))),
                                  );
                                },
                                reservedSize: 28,
                              ),
                            ),
                            leftTitles: AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                            topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                            rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          ),
                          gridData: FlGridData(
                            show: true,
                            drawVerticalLine: false,
                            getDrawingHorizontalLine: (value) => FlLine(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5), strokeWidth: 1, dashArray: [4, 4]),
                          ),
                          borderData: FlBorderData(show: false),
                          barGroups: List.generate(7, (i) => BarChartGroupData(
                            x: i,
                            barRods: [
                              BarChartRodData(
                                toY: weeklyData[i],
                                color: Theme.of(context).colorScheme.primary,
                                width: 28,
                                borderRadius: BorderRadius.circular(6),
                              )
                            ],
                          )),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Distribution (Mocked visually like web)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Distribución de energía', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 140,
                            child: PieChart(
                              PieChartData(
                                sectionsSpace: 4,
                                centerSpaceRadius: 40,
                                sections: [
                                  PieChartSectionData(value: 50, color: Theme.of(context).colorScheme.primary, showTitle: false, radius: 25),
                                  PieChartSectionData(value: 30, color: Theme.of(context).colorScheme.onSecondaryContainer, showTitle: false, radius: 25),
                                  PieChartSectionData(value: 20, color: Theme.of(context).colorScheme.secondaryContainer, showTitle: false, radius: 25),
                                ],
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _LegendItem(color: Theme.of(context).colorScheme.primary, label: "Trabajo", value: "50%"),
                              const SizedBox(height: 12),
                              _LegendItem(color: Theme.of(context).colorScheme.onSecondaryContainer, label: "Estudio", value: "30%"),
                              const SizedBox(height: 12),
                              _LegendItem(color: Theme.of(context).colorScheme.secondaryContainer, label: "Otros", value: "20%"),
                            ],
                          ),
                        )
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Performance Summary Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [BoxShadow(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('RESUMEN GLOBAL', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onPrimary.withValues(alpha: 0.9), letterSpacing: 1.0)),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Racha actual', style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onPrimary.withValues(alpha: 0.9))),
                        Text('$currentStreak días', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onPrimary)),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Divider(color: Theme.of(context).colorScheme.onPrimary.withValues(alpha: 0.2)),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Pomodoros totales', style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onPrimary.withValues(alpha: 0.9))),
                        Text('${_pomodoros.length}', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onPrimary)),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Divider(color: Theme.of(context).colorScheme.onPrimary.withValues(alpha: 0.2)),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Total concentrado', style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onPrimary.withValues(alpha: 0.9))),
                        Text('${totalHours.toStringAsFixed(1)} horas', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onPrimary)),
                      ],
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

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  final Color bgColor;

  const _StatCard({required this.icon, required this.label, required this.value, required this.color, required this.bgColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 16),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.grey)),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  final String value;

  const _LegendItem({required this.color, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
          ],
        ),
        Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey)),
      ],
    );
  }
}
