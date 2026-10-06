import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../config/api_constants.dart';

class AppAvatar extends StatelessWidget {
  final String? imageUrl;
  final String? initials;
  final double size;
  final Color? backgroundColor;
  final bool showBorder;

  const AppAvatar({
    super.key,
    this.imageUrl,
    this.initials,
    this.size = 40,
    this.backgroundColor,
    this.showBorder = false,
  });

  @override
  Widget build(BuildContext context) {
    final bg = backgroundColor ?? AppTheme.primary;
    final displayInitials = initials ?? '?';

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: bg,
        border: showBorder
            ? Border.all(color: AppTheme.white, width: 2)
            : null,
        boxShadow: showBorder
            ? [
                BoxShadow(
                  color: AppTheme.gray300.withOpacity(0.4),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: imageUrl != null && imageUrl!.isNotEmpty
          ? ClipOval(
              child: Image.network(
                '${ApiConstants.uploads}/${imageUrl}',
                width: size,
                height: size,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _buildInitials(bg, displayInitials),
              ),
            )
          : _buildInitials(bg, displayInitials),
    );
  }

  Widget _buildInitials(Color bg, String text) {
    return Center(
      child: Text(
        text,
        style: TextStyle(
          color: AppTheme.white,
          fontSize: size * 0.38,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
