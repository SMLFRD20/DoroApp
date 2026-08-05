import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthNotifier extends ChangeNotifier {
  Session? _session;
  bool _isLoading = true;

  Session? get session => _session;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _session != null;

  AuthNotifier() {
    _initializeAuth();
  }

  void _initializeAuth() {
    final supabase = Supabase.instance.client;

    supabase.auth.getSession().then((session) {
      _session = session;
      _isLoading = false;
      notifyListeners();
    });

    supabase.auth.onAuthStateChange.listen((data) {
      _session = data.session;
      notifyListeners();
    });
  }

  Future<void> signOut() async {
    await Supabase.instance.client.auth.signOut();
  }

  Future<void> refreshSession() async {
    final res = await Supabase.instance.client.auth.refreshSession();
    _session = res.session;
    notifyListeners();
  }
}
