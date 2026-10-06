import '../config/api_constants.dart';
import 'api_service.dart';
import 'storage_service.dart';

class AuthService {
  /// Connexion au backend Spring Boot.
  /// Requête  : POST /api/auth/login  { email, password }
  /// Réponse  : { token, type, username, roles[], droits[], userId, agentId }
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final raw = await ApiService.post(
      '${ApiConstants.auth}/login',
      body: {'email': email, 'password': password},
    );

    // Le backend Spring renvoie "token". On accepte aussi les variantes Laravel/Sanctum
    // par sécurité (access_token / accessToken).
    final token = (raw['token'] ?? raw['access_token'] ?? raw['accessToken'])?.toString();

    final user = <String, dynamic>{
      ...raw,
      if (token != null && token.isNotEmpty) 'token': token,
      'roles': _toStringList(raw['roles']),
      'droits': _toStringList(raw['droits']),
    };

    if (token != null && token.isNotEmpty) {
      await StorageService.saveToken(token);
      await StorageService.saveUser(user);
    }

    return user;
  }

  static Future<void> logout() async {
    await StorageService.clear();
  }

  static Future<Map<String, dynamic>?> getCurrentUser() async {
    return await StorageService.getUser();
  }

  static Future<bool> isLoggedIn() async {
    return await StorageService.isLoggedIn();
  }

  /// Normalise une valeur en liste de chaines (gere String, liste de String, liste de Map).
  static List<String> _toStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) {
      return value.map((e) {
        if (e is String) return e;
        if (e is Map) {
          return (e['nomRole'] ?? e['nom'] ?? e['authority'] ?? e['name'] ?? e).toString();
        }
        return e.toString();
      }).toList();
    }
    return [value.toString()];
  }
}
