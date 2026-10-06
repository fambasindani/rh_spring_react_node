import 'package:flutter/foundation.dart';
import '../services/pointage_service.dart';
import '../services/location_service.dart';

class PointageProvider extends ChangeNotifier {
  List<dynamic> _historique = [];
  bool _isLoading = false;
  bool _isClocking = false;
  String? _error;
  Map<String, dynamic>? _dernierPointage;

  List<dynamic> get historique => _historique;
  bool get isLoading => _isLoading;
  bool get isClocking => _isClocking;
  String? get error => _error;
  Map<String, dynamic>? get dernierPointage => _dernierPointage;

  Future<Map<String, dynamic>?> effectuerPointage({
    required int agentId,
    required String type,
    String? photoBase64,
    String? justification,
  }) async {
    _isClocking = true;
    _error = null;
    notifyListeners();

    try {
      final position = await LocationService.getCurrentPosition();
      final response = await PointageService.effectuerPointage(
        agentId: agentId,
        type: type,
        latitude: position.latitude,
        longitude: position.longitude,
        precision: position.accuracy,
        infosAppareil: LocationService.getDeviceInfo(),
        photoBase64: photoBase64,
        justification: justification,
      );
      _dernierPointage = response;
      _isClocking = false;
      notifyListeners();
      return response;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isClocking = false;
      notifyListeners();
      return null;
    }
  }

  Future<void> chargerHistorique(int agentId, String debut, String fin) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _historique = await PointageService.historique(agentId, debut, fin);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
    }
  }
}
