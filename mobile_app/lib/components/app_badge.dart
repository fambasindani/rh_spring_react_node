import 'package:flutter/material.dart';
import '../config/theme.dart';

class AppBadge extends StatelessWidget {
  final String label;
  final Color? color;
  final Color? textColor;
  final bool isSmall;
  final bool isDot;
  final IconData? icon;

  const AppBadge({
    super.key,
    required this.label,
    this.color,
    this.textColor,
    this.isSmall = false,
    this.isDot = false,
    this.icon,
  });

  factory AppBadge.success(String label, {bool isSmall = false}) {
    return AppBadge(
      label: label,
      color: AppTheme.successLight,
      textColor: AppTheme.success,
      isSmall: isSmall,
    );
  }

  factory AppBadge.warning(String label, {bool isSmall = false}) {
    return AppBadge(
      label: label,
      color: AppTheme.warningLight,
      textColor: AppTheme.warning,
      isSmall: isSmall,
    );
  }

  factory AppBadge.danger(String label, {bool isSmall = false}) {
    return AppBadge(
      label: label,
      color: AppTheme.dangerLight,
      textColor: AppTheme.danger,
      isSmall: isSmall,
    );
  }

  factory AppBadge.info(String label, {bool isSmall = false}) {
    return AppBadge(
      label: label,
      color: AppTheme.primaryLight,
      textColor: AppTheme.primary,
      isSmall: isSmall,
    );
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = color ?? AppTheme.gray100;
    final fgColor = textColor ?? AppTheme.gray600;
    final fontSize = isSmall ? 11.0 : 13.0;
    final padding = isSmall
        ? const EdgeInsets.symmetric(horizontal: 6, vertical: 2)
        : const EdgeInsets.symmetric(horizontal: 10, vertical: 4);

    if (isDot) {
      return Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: bgColor,
        ),
      );
    }

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: fontSize + 2, color: fgColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              color: fgColor,
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
