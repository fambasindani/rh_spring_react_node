import 'package:flutter/foundation.dart';
import '../services/auth_service.dart';
import '../services/agent_service.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  Map<String, dynamic>? _agent;
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get user => _user;
  Map<String, dynamic>? get agent => _agent;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _user != null;
  String? get token => _user?['token'];
  String? get role => _user?['roles']?.isNotEmpty == true ? _user!['roles'][0] : null;
  List<String> get droits {
    final d = _user?['droits'];
    if (d == null) return [];
    return List<String>.from(d);
  }

  String get displayName {
    if (_agent != null) {
      final nom = _agent!['nom'] ?? '';
      final postnom = _agent!['postnom'] ?? '';
      final prenom = _agent!['prenom'] ?? '';
      final full = '$nom $postnom $prenom'.trim();
      if (full.isNotEmpty) return full;
    }
    return _user?['username'] ?? 'Agent';
  }

  String get initials {
    if (_agent != null) {
      final n = _agent!['nom'] ?? '';
      final p = _agent!['prenom'] ?? '';
      if (n.isNotEmpty && p.isNotEmpty) return '${n[0]}${p[0]}'.toUpperCase();
      if (n.isNotEmpty) return n.substring(0, n.length.clamp(0, 2)).toUpperCase();
    }
    final username = _user?['username'] ?? '';
    if (username.isEmpty) return '?';
    final parts = username.split('@').first.split('.');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return username.substring(0, username.length.clamp(0, 2)).toUpperCase();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await AuthService.login(email, password);
      _user = response;
      await _loadAgent();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> _loadAgent() async {
    final agentId = _user?['agentId'];
    if (agentId == null) return;
    try {
      final id = agentId is String ? int.parse(agentId) : agentId as int;
      _agent = await AgentService.getAgent(id);
    } catch (_) {}
  }

  Future<void> logout() async {
    await AuthService.logout();
    _user = null;
    _agent = null;
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    final user = await AuthService.getCurrentUser();
    if (user != null) {
      _user = user;
      await _loadAgent();
      notifyListeners();
    }
  }
}
