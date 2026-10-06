import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';
import '../components/index.dart';
import '../providers/auth_provider.dart';
import '../providers/pointage_provider.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int _selectedNav = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadData());
  }

  void _loadData() {
    final auth = context.read<AuthProvider>();
    final pointage = context.read<PointageProvider>();
    final agentId = auth.user?['agentId'];
    if (agentId != null) {
      final id = agentId is String ? int.parse(agentId) : agentId as int;
      final now = DateTime.now();
      final debut = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      pointage.chargerHistorique(id, debut, debut);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final pointage = context.watch<PointageProvider>();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Image.asset('assets/dgrad.png', width: 28, height: 28, fit: BoxFit.contain),
            ),
            const SizedBox(width: 8),
            const Text('Pointage RH'),
          ],
        ),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.notifications_outlined),
          ),
          PopupMenuButton<String>(
            icon: AppAvatar(
              initials: auth.initials,
              size: 32,
            ),
            onSelected: (value) {
              if (value == 'logout') {
                auth.logout();
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
            itemBuilder: (context) => <PopupMenuEntry<String>>[
              PopupMenuItem(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      auth.displayName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppTheme.gray900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      auth.user?['username'] ?? '',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.gray500,
                      ),
                    ),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout, size: 18, color: AppTheme.danger),
                    SizedBox(width: 8),
                    Text('Déconnexion', style: TextStyle(color: AppTheme.danger)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: _buildBody(pointage, auth),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedNav,
        onDestinationSelected: (i) => setState(() => _selectedNav = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Accueil'),
          NavigationDestination(icon: Icon(Icons.fingerprint), selectedIcon: Icon(Icons.fingerprint), label: 'Pointage'),
          NavigationDestination(icon: Icon(Icons.history), selectedIcon: Icon(Icons.history), label: 'Historique'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }

  Widget _buildBody(PointageProvider pointage, AuthProvider auth) {
    switch (_selectedNav) {
      case 0:
        return _buildHome(pointage, auth);
      case 1:
        return _buildPointage(auth);
      case 2:
        return _buildHistorique(auth);
      case 3:
        return _buildProfil(auth);
      default:
        return _buildHome(pointage, auth);
    }
  }

  Widget _buildHome(PointageProvider pointage, AuthProvider auth) {
    final now = DateTime.now();
    final heure = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    final dateStr = DateFormat('dd/MM/yyyy', 'fr').format(now);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primary, AppTheme.primaryDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bonjour, ${auth.displayName}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '$dateStr • $heure',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppTheme.white.withValues(alpha: 0.8),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    _buildStatMini('Arrivée', '--:--', Icons.login),
                    const SizedBox(width: 12),
                    _buildStatMini('Départ', '--:--', Icons.logout),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Actions rapides',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.gray900),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildQuickAction(
                  icon: Icons.login,
                  label: 'Pointer\narrivée',
                  color: AppTheme.success,
                  onTap: () => _doPointage('ARRIVEE', auth),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildQuickAction(
                  icon: Icons.logout,
                  label: 'Pointer\ndépart',
                  color: AppTheme.danger,
                  onTap: () => _doPointage('DEPART', auth),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            'Aujourd\'hui',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.gray900),
          ),
          const SizedBox(height: 12),
          if (pointage.isLoading)
            const ListSkeleton(items: 3)
          else if (pointage.historique.isEmpty)
            const AppEmptyState(
              icon: Icons.fingerprint,
              title: 'Aucun pointage aujourd\'hui',
              subtitle: 'Utilisez le bouton ci-dessous pour pointer',
            )
          else
            ...pointage.historique.map((p) => _buildPointageItem(p)),
        ],
      ),
    );
  }

  Widget _buildStatMini(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.white.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppTheme.white, size: 18),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 11, color: AppTheme.white.withValues(alpha: 0.7))),
                Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.white)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction({required IconData icon, required String label, required Color color, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(label, textAlign: TextAlign.center, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: color, height: 1.3)),
          ],
        ),
      ),
    );
  }

  Widget _buildPointageItem(dynamic p) {
    final statut = p['statut'] ?? '';
    final statutColor = statut == 'VALIDE'
        ? AppTheme.success
        : statut == 'RETARD'
            ? AppTheme.warning
            : statut == 'HORS_ZONE'
                ? AppTheme.danger
                : AppTheme.gray500;
    final minutesRetard = p['minutesRetard'] ?? 0;
    final zone = p['nomZone'];

    return AppCard(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(color: statutColor.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Icon(p['type'] == 'ARRIVEE' ? Icons.login : Icons.logout, color: statutColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(p['type'] == 'ARRIVEE' ? 'Arrivée' : 'Départ', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.gray900)),
                    if (minutesRetard > 0) ...[
                      const SizedBox(width: 6),
                      Text('+$minutesRetard min', style: const TextStyle(fontSize: 11, color: AppTheme.warning, fontWeight: FontWeight.w600)),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(_formatHorodatage(p['horodatage']), style: const TextStyle(fontSize: 12, color: AppTheme.gray500)),
                if (zone != null) ...[
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 12, color: AppTheme.gray400),
                      const SizedBox(width: 3),
                      Text(zone, style: const TextStyle(fontSize: 11, color: AppTheme.gray400)),
                    ],
                  ),
                ],
              ],
            ),
          ),
          AppBadge(label: statut, color: statutColor.withValues(alpha: 0.1), textColor: statutColor),
        ],
      ),
    );
  }

  Widget _buildPointage(AuthProvider auth) {
    final pointage = context.watch<PointageProvider>();
    final now = DateTime.now();

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: pointage.isClocking ? AppTheme.primary.withValues(alpha: 0.1) : AppTheme.gray100,
                border: Border.all(color: pointage.isClocking ? AppTheme.primary : AppTheme.gray200, width: 4),
              ),
              child: Center(
                child: pointage.isClocking
                    ? const CircularProgressIndicator(color: AppTheme.primary)
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.fingerprint, size: 64, color: AppTheme.primary),
                          const SizedBox(height: 8),
                          Text(
                            '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}',
                            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppTheme.gray900),
                          ),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 32),
            const Text('Appuyez pour pointer', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppTheme.gray700)),
            const SizedBox(height: 8),
            Text(DateFormat('dd/MM/yyyy', 'fr').format(now), style: const TextStyle(fontSize: 14, color: AppTheme.gray500)),
            if (pointage.error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppTheme.dangerLight, borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppTheme.danger, size: 20),
                    const SizedBox(width: 8),
                    Expanded(child: Text(pointage.error!, style: const TextStyle(color: AppTheme.danger, fontSize: 13))),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(child: AppButton(label: 'Arrivée', icon: Icons.login, color: AppTheme.success, isLoading: pointage.isClocking, isExpanded: true, onPressed: () => _doPointage('ARRIVEE', auth))),
                const SizedBox(width: 12),
                Expanded(child: AppButton(label: 'Départ', icon: Icons.logout, color: AppTheme.danger, isLoading: pointage.isClocking, isExpanded: true, onPressed: () => _doPointage('DEPART', auth))),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistorique(AuthProvider auth) {
    final pointage = context.watch<PointageProvider>();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: AppSearchBar(hint: 'Rechercher un pointage...', onChanged: (v) {}),
        ),
        Expanded(
          child: pointage.isLoading
              ? const ListSkeleton(items: 8)
              : pointage.historique.isEmpty
                  ? const AppEmptyState(icon: Icons.history, title: 'Aucun historique', subtitle: 'Vos pointages apparaîtront ici')
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: pointage.historique.length,
                      itemBuilder: (_, i) => _buildPointageItem(pointage.historique[i]),
                    ),
        ),
      ],
    );
  }

  Widget _buildProfil(AuthProvider auth) {
    final agent = auth.agent;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SizedBox(height: 20),
          AppAvatar(initials: auth.initials, size: 80, showBorder: true),
          const SizedBox(height: 16),
          Text(
            auth.displayName,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.gray900),
          ),
          const SizedBox(height: 4),
          AppBadge(label: auth.user?['username'] ?? ''),
          const SizedBox(height: 32),
          AppCard(
            child: Column(
              children: [
                _buildProfileItem(Icons.person_outline, 'Nom complet', auth.displayName),
                const Divider(height: 1),
                _buildProfileItem(Icons.badge_outlined, 'Matricule', agent?['matricule'] ?? '--'),
                const Divider(height: 1),
                _buildProfileItem(Icons.work_outline, 'Direction', agent?['directionNom'] ?? agent?['directionSigle'] ?? '--'),
                const Divider(height: 1),
                _buildProfileItem(Icons.star_outline, 'Grade', agent?['gradeNom'] ?? agent?['gradeSigle'] ?? '--'),
                const Divider(height: 1),
                _buildProfileItem(Icons.workspaces_outlined, 'Fonction', agent?['fonctionNom'] ?? '--'),
                const Divider(height: 1),
                _buildProfileItem(Icons.email_outlined, 'Email', agent?['email'] ?? auth.user?['username'] ?? '--'),
                const Divider(height: 1),
                _buildProfileItem(Icons.phone_outlined, 'Téléphone', agent?['telephone'] ?? '--'),
                const Divider(height: 1),
                _buildProfileItem(Icons.circle_outlined, 'Sexe', agent?['sexe'] ?? '--'),
                const Divider(height: 1),
                _buildProfileItem(Icons.home_outlined, 'Province', agent?['province'] ?? '--'),
              ],
            ),
          ),
          const SizedBox(height: 24),
          AppButton(
            label: 'Déconnexion',
            icon: Icons.logout,
            color: AppTheme.danger,
            isExpanded: true,
            isOutlined: true,
            onPressed: () {
              auth.logout();
              Navigator.pushReplacementNamed(context, '/login');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProfileItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.gray400),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.gray500)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppTheme.gray900)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatHorodatage(dynamic horodatage) {
    if (horodatage == null || horodatage.toString().isEmpty) return '-';
    try {
      final dt = DateTime.parse(horodatage.toString());
      return DateFormat('dd/MM/yyyy HH:mm', 'fr').format(dt);
    } catch (_) {
      return horodatage.toString();
    }
  }

  void _doPointage(String type, AuthProvider auth) async {
    final agentId = auth.user?['agentId'];
    if (agentId == null) return;

    final now = TimeOfDay.now();
    final needsJustification = _checkNeedsJustification(type, now);

    if (needsJustification) {
      final justification = await _showJustificationDialog(type);
      if (justification == null) return;
      await _submitPointage(agentId, type, auth, justification: justification);
    } else {
      await _submitPointage(agentId, type, auth);
    }
  }

  bool _checkNeedsJustification(String type, TimeOfDay now) {
    final minutes = now.hour * 60 + now.minute;
    if (type == 'ARRIVEE') {
      return minutes > 8 * 60 + 15;
    } else {
      return minutes < 16 * 60 + 30;
    }
  }

  Future<String?> _showJustificationDialog(String type) async {
    final controller = TextEditingController();
    final isLate = type == 'ARRIVEE';
    return showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(
              isLate ? Icons.access_time : Icons.exit_to_app,
              color: isLate ? AppTheme.warning : AppTheme.danger,
            ),
            const SizedBox(width: 8),
            Text(isLate ? 'Justification retard' : 'Sortie anticipée'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isLate
                  ? 'Vous arrivez après l\'heure prévue (08h15). Veuillez justifier votre retard.'
                  : 'Vous quittez avant l\'heure de sortie (16h30). Veuillez justifier.',
              style: const TextStyle(fontSize: 14, color: AppTheme.gray600),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              maxLines: 3,
              autofocus: true,
              decoration: const InputDecoration(
                hintText: 'Motif de votre retard / sortie anticipée...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.trim().isEmpty) return;
              Navigator.pop(ctx, controller.text.trim());
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: AppTheme.white,
            ),
            child: const Text('Confirmer'),
          ),
        ],
      ),
    );
  }

  Future<void> _submitPointage(int agentId, String type, AuthProvider auth, {String? justification}) async {
    final pointage = context.read<PointageProvider>();
    final result = await pointage.effectuerPointage(
      agentId: agentId is String ? int.parse('$agentId') : agentId,
      type: type,
      justification: justification,
    );

    if (mounted && result != null) {
      final statut = result['statut'] ?? '';
      final message = result['message'] ?? 'Pointage enregistré';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: statut == 'VALIDE' ? AppTheme.success : statut == 'RETARD' ? AppTheme.warning : AppTheme.danger,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      _loadData();
    }
  }
}
