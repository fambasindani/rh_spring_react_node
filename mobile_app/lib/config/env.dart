import 'package:flutter_dotenv/flutter_dotenv.dart';

class Env {
  static String get baseUrl {
    final url = dotenv.env['BASE_URL'] ?? 'http://10.0.2.2:8083';
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }

  static String get appName => dotenv.env['APP_NAME'] ?? 'Pointage RH';
  static String get appVersion => dotenv.env['APP_VERSION'] ?? '1.0.0';
}
