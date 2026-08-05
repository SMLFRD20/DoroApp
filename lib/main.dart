import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/timer_screen.dart';
import 'screens/tasks_screen.dart';
import 'screens/statistics_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/layout_screen.dart';
import 'services/auth_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await dotenv.load(fileName: ".env");
  
  await Supabase.initialize(
    url: dotenv.env['VITE_SUPABASE_URL'] ?? '',
    publishableKey: dotenv.env['VITE_SUPABASE_ANON_KEY'] ?? '',
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthNotifier()),
      ],
      child: const DoroApp(),
    ),
  );
}

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorDashboardKey = GlobalKey<NavigatorState>(debugLabel: 'DashboardTab');
final _shellNavigatorTimerKey = GlobalKey<NavigatorState>(debugLabel: 'TimerTab');
final _shellNavigatorTasksKey = GlobalKey<NavigatorState>(debugLabel: 'TasksTab');
final _shellNavigatorStatsKey = GlobalKey<NavigatorState>(debugLabel: 'StatsTab');
final _shellNavigatorProfileKey = GlobalKey<NavigatorState>(debugLabel: 'ProfileTab');

class DoroApp extends StatelessWidget {
  const DoroApp({super.key});

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthNotifier>();

    final router = GoRouter(
      navigatorKey: _rootNavigatorKey,
      initialLocation: '/',
      redirect: (context, state) {
        if (authState.isLoading) return null;
        
        final isAuthRoute = state.matchedLocation == '/' || state.matchedLocation == '/signup';
        final isAuthenticated = authState.isAuthenticated;

        if (!isAuthenticated && !isAuthRoute) {
          return '/';
        }
        if (isAuthenticated && isAuthRoute) {
          return '/app';
        }
        return null;
      },
      routes: [
        GoRoute(
          path: '/',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const LoginScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) => FadeTransition(opacity: animation, child: child),
          ),
        ),
        GoRoute(
          path: '/signup',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const SignupScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) => FadeTransition(opacity: animation, child: child),
          ),
        ),
        StatefulShellRoute(
          builder: (context, state, navigationShell) {
            return LayoutScreen(navigationShell: navigationShell);
          },
          navigatorContainerBuilder: (context, navigationShell, children) {
            return AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              transitionBuilder: (child, animation) => FadeTransition(opacity: animation, child: child),
              child: KeyedSubtree(
                key: ValueKey<int>(navigationShell.currentIndex),
                child: children[navigationShell.currentIndex],
              ),
            );
          },
          branches: [
            StatefulShellBranch(
              navigatorKey: _shellNavigatorDashboardKey,
              routes: [
                GoRoute(
                  path: '/app',
                  pageBuilder: (context, state) => CustomTransitionPage(
                    key: state.pageKey,
                    child: const DashboardScreen(),
                    transitionsBuilder: (context, animation, secondaryAnimation, child) => FadeTransition(opacity: animation, child: child),
                  ),
                  routes: [],
                ),
              ],
            ),
            StatefulShellBranch(
              navigatorKey: _shellNavigatorTimerKey,
              routes: [
                GoRoute(
                  path: '/app/timer',
                  pageBuilder: (context, state) => CustomTransitionPage(
                    key: state.pageKey,
                    child: TimerScreen(taskId: state.uri.queryParameters['taskId']),
                    transitionsBuilder: (context, animation, secondaryAnimation, child) => FadeTransition(opacity: animation, child: child),
                  ),
                ),
              ],
            ),
            StatefulShellBranch(
              navigatorKey: _shellNavigatorTasksKey,
              routes: [
                GoRoute(
                  path: '/app/tasks',
                  pageBuilder: (context, state) => CustomTransitionPage(
                    key: state.pageKey,
                    child: const TasksScreen(),
                    transitionsBuilder: (context, animation, secondaryAnimation, child) => FadeTransition(opacity: animation, child: child),
                  ),
                ),
              ],
            ),
            StatefulShellBranch(
              navigatorKey: _shellNavigatorStatsKey,
              routes: [
                GoRoute(
                  path: '/app/statistics',
                  pageBuilder: (context, state) => CustomTransitionPage(
                    key: state.pageKey,
                    child: const StatisticsScreen(),
                    transitionsBuilder: (context, animation, secondaryAnimation, child) => FadeTransition(opacity: animation, child: child),
                  ),
                ),
              ],
            ),
            StatefulShellBranch(
              navigatorKey: _shellNavigatorProfileKey,
              routes: [
                GoRoute(
                  path: '/app/profile',
                  pageBuilder: (context, state) => CustomTransitionPage(
                    key: state.pageKey,
                    child: const ProfileScreen(),
                    transitionsBuilder: (context, animation, secondaryAnimation, child) => FadeTransition(opacity: animation, child: child),
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );

    return MaterialApp.router(
      title: 'DoroApp',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFF9F8F6),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFA8C3A0),
          primary: const Color(0xFFA8C3A0),
          secondary: const Color(0xFFE8E5E1),
          onSecondary: const Color(0xFF4E6B4A),
          surface: const Color(0xFFFFFFFF),
          error: const Color(0xFFD97B66),
        ),
        textTheme: GoogleFonts.outfitTextTheme().apply(
          bodyColor: const Color(0xFF2A3B28),
          displayColor: const Color(0xFF2A3B28),
        ),
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}
