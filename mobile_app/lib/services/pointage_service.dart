import '../config/api_constants.dart';
import 'api_service.dart';

class PointageService {
  static Future<Map<String, dynamic>> effectuerPointage({
    required int agentId,
    required String type,
    required double latitude,
    required double longitude,
    double? precision,
    String? infosAppareil,
    String? idAppareil,
    String? photoBase64,
    String? justification,
  }) async {
    return await ApiService.post(
      ApiConstants.pointages,
      body: {
        'agentId': agentId,
        'type': type,
        'latitude': latitude,
        'longitude': longitude,
        'precision': precision,
        'infosAppareil': infosAppareil,
        'idAppareil': idAppareil,
        'photoBase64': photoBase64,
        'justification': justification,
      },
    );
  }

  static Future<List<dynamic>> historique(int agentId, String debut, String fin) async {
    final response = await ApiService.get(
      '${ApiConstants.pointages}/historique/$agentId?debut=$debut&fin=$fin',
    );
    return response['data'] ?? response.values.first;
  }
}
