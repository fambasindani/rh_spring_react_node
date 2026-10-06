import 'package:flutter/material.dart';
import '../config/theme.dart';

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final Color? color;
  final Color? textColor;
  final bool isLoading;
  final bool isOutlined;
  final bool isSmall;
  final bool isExpanded;
  final double? borderRadius;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.color,
    this.textColor,
    this.isLoading = false,
    this.isOutlined = false,
    this.isSmall = false,
    this.isExpanded = false,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = color ?? AppTheme.primary;
    final fgColor = textColor ?? AppTheme.white;
    final radius = borderRadius ?? 12;
    final padding =
        isSmall ? const EdgeInsets.symmetric(horizontal: 12, vertical: 8) : const EdgeInsets.symmetric(horizontal: 20, vertical: 14);

    if (isOutlined) {
      return SizedBox(
        width: isExpanded ? double.infinity : null,
        child: OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: bgColor,
            side: BorderSide(color: bgColor),
            padding: padding,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(radius),
            ),
          ),
          child: _buildContent(fgColor: bgColor),
        ),
      );
    }

    return SizedBox(
      width: isExpanded ? double.infinity : null,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: bgColor,
          foregroundColor: fgColor,
          disabledBackgroundColor: bgColor.withOpacity(0.6),
          padding: padding,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radius),
          ),
        ),
        child: _buildContent(fgColor: fgColor),
      ),
    );
  }

  Widget _buildContent({required Color fgColor}) {
    if (isLoading) {
      return SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(fgColor),
        ),
      );
    }
    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: isSmall ? 16 : 18, color: fgColor),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(fontSize: isSmall ? 13 : 15, fontWeight: FontWeight.w600)),
        ],
      );
    }
    return Text(label, style: TextStyle(fontSize: isSmall ? 13 : 15, fontWeight: FontWeight.w600));
  }
}
