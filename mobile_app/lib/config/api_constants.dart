import 'env.dart';

class ApiConstants {
  static String get baseUrl => Env.baseUrl;
  static String get auth => '$baseUrl/api/auth';
  static String get agents => '$baseUrl/api/agents';
  static String get pointages => '$baseUrl/api/pointages';
  static String get zonesTravail => '$baseUrl/api/zones-travail';
  static String get horaires => '$baseUrl/api/horaires-travail';
  static String get joursFeries => '$baseUrl/api/jours-feries';
  static String get presences => '$baseUrl/api/presences';
  static String get notifications => '$baseUrl/api/notifications';
  static String get uploads => '$baseUrl/uploads';
}
