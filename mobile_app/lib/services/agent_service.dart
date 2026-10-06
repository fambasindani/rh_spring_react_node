import '../config/api_constants.dart';
import 'api_service.dart';

class AgentService {
  static Future<Map<String, dynamic>> getAgent(int agentId) async {
    final response = await ApiService.get('${ApiConstants.agents}/$agentId');
    return response;
  }
}
