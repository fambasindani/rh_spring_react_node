import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env.dart';
import 'storage_service.dart';

class ApiService {
  static const Duration _timeout = Duration(seconds: 20);

  static Future<Map<String, String>> _headers() async {
    final token = await StorageService.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  // Exécute la requête HTTP et transforme les erreurs réseau en message clair.
  static Future<http.Response> _request(Future<http.Response> Function() fn) async {
    try {
      return await fn().timeout(_timeout);
    } on TimeoutException {
      throw Exception('Délai dépassé : le serveur ne répond pas (${Env.baseUrl}).');
    } catch (_) {
      throw Exception(
        'Impossible de joindre le serveur (${Env.baseUrl}). '
        'Vérifiez que le backend est lancé, que le téléphone est sur le même réseau Wi-Fi et que le port 8083 est autorisé.',
      );
    }
  }

  static Future<Map<String, dynamic>> get(String url) async {
    final headers = await _headers();
    final response = await _request(() => http.get(Uri.parse(url), headers: headers));
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> post(String url, {dynamic body}) async {
    final headers = await _headers();
    final response = await _request(
      () => http.post(Uri.parse(url), headers: headers, body: body != null ? jsonEncode(body) : null),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> put(String url, {dynamic body}) async {
    final headers = await _headers();
    final response = await _request(
      () => http.put(Uri.parse(url), headers: headers, body: body != null ? jsonEncode(body) : null),
    );
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> delete(String url) async {
    final headers = await _headers();
    final response = await _request(() => http.delete(Uri.parse(url), headers: headers));
    return _handleResponse(response);
  }

  static Future<Map<String, dynamic>> postMultipart(String url, {Map<String, String>? fields, String? filePath, String? fileField}) async {
    final token = await StorageService.getToken();
    final request = http.MultipartRequest('POST', Uri.parse(url));
    request.headers['Accept'] = 'application/json';
    if (token != null && token.isNotEmpty) request.headers['Authorization'] = 'Bearer $token';
    if (fields != null) request.fields.addAll(fields);
    if (filePath != null && fileField != null) {
      request.files.add(await http.MultipartFile.fromPath(fileField, filePath));
    }

    http.Response response;
    try {
      final streamed = await request.send().timeout(_timeout);
      response = await http.Response.fromStream(streamed);
    } on TimeoutException {
      throw Exception('Délai dépassé : le serveur ne répond pas (${Env.baseUrl}).');
    } catch (_) {
      throw Exception('Impossible de joindre le serveur (${Env.baseUrl}).');
    }
    return _handleResponse(response);
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    final status = response.statusCode;

    dynamic body;
    try {
      body = response.body.isNotEmpty ? jsonDecode(response.body) : null;
    } catch (_) {
      body = null;
    }

    if (status >= 200 && status < 300) {
      if (body is Map<String, dynamic>) return body;
      if (body is List) return {'data': body};
      return <String, dynamic>{};
    }

    var message = 'Erreur $status';
    if (body is Map) {
      final base = (body['message'] ?? body['error'] ?? message).toString();
      message = base;
      final errors = body['errors'];
      if (errors is Map && errors.isNotEmpty) {
        message = '$base : ${errors.values.first}';
      }
    } else if (response.body.isNotEmpty && response.body.length < 300) {
      message = 'Erreur $status : ${response.body}';
    }
    throw Exception(message);
  }
}
