import 'package:flutter/material.dart';
import '../config/theme.dart';

class AppDropdown<T> extends StatelessWidget {
  final String label;
  final String? hint;
  final T? value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?>? onChanged;
  final String? Function(T?)? validator;
  final IconData? prefixIcon;
  final bool enabled;

  const AppDropdown({
    super.key,
    required this.label,
    this.hint,
    this.value,
    required this.items,
    this.onChanged,
    this.validator,
    this.prefixIcon,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppTheme.gray700,
          ),
        ),
        const SizedBox(height: 6),
        DropdownButtonFormField<T>(
          value: value,
          items: items,
          onChanged: enabled ? onChanged : null,
          validator: validator,
          icon: const Icon(Icons.keyboard_arrow_down, color: AppTheme.gray400),
          decoration: InputDecoration(
            hintText: hint ?? 'Veuillez sélectionner...',
            prefixIcon: prefixIcon != null
                ? Icon(prefixIcon, color: AppTheme.gray400, size: 20)
                : null,
          ),
          style: const TextStyle(
            fontSize: 15,
            color: AppTheme.gray900,
          ),
          isExpanded: true,
          borderRadius: BorderRadius.circular(12),
        ),
      ],
    );
  }
}
