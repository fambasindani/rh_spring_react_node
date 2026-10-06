import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';

class AppDatePicker extends StatelessWidget {
  final String label;
  final String? hint;
  final DateTime? value;
  final ValueChanged<DateTime?>? onChanged;
  final DateTime? firstDate;
  final DateTime? lastDate;
  final String? Function(DateTime?)? validator;
  final bool enabled;
  final bool onlyDate;

  const AppDatePicker({
    super.key,
    required this.label,
    this.hint,
    this.value,
    this.onChanged,
    this.firstDate,
    this.lastDate,
    this.validator,
    this.enabled = true,
    this.onlyDate = true,
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
        TextFormField(
          readOnly: true,
          enabled: enabled,
          validator: validator != null
              ? (v) => validator!(value)
              : null,
          onTap: () => _pickDate(context),
          decoration: InputDecoration(
            hintText: hint ?? 'Sélectionnez une date',
            prefixIcon: const Icon(Icons.calendar_today, color: AppTheme.gray400, size: 20),
            suffixIcon: value != null
                ? IconButton(
                    onPressed: enabled ? () => onChanged?.call(null) : null,
                    icon: const Icon(Icons.clear, size: 18, color: AppTheme.gray400),
                  )
                : null,
          ),
          controller: TextEditingController(
            text: value != null
                ? DateFormat('dd/MM/yyyy').format(value!)
                : '',
          ),
          style: const TextStyle(
            fontSize: 15,
            color: AppTheme.gray900,
          ),
        ),
      ],
    );
  }

  Future<void> _pickDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: value ?? DateTime.now(),
      firstDate: firstDate ?? DateTime(2020),
      lastDate: lastDate ?? DateTime(2030),
      locale: const Locale('fr'),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(primary: AppTheme.primary),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      onChanged?.call(picked);
    }
  }
}

class AppTimePicker extends StatelessWidget {
  final String label;
  final TimeOfDay? value;
  final ValueChanged<TimeOfDay?>? onChanged;
  final bool enabled;

  const AppTimePicker({
    super.key,
    required this.label,
    this.value,
    this.onChanged,
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
        TextFormField(
          readOnly: true,
          enabled: enabled,
          onTap: () => _pickTime(context),
          decoration: InputDecoration(
            hintText: 'Sélectionnez une heure',
            prefixIcon: const Icon(Icons.access_time, color: AppTheme.gray400, size: 20),
            suffixIcon: value != null
                ? IconButton(
                    onPressed: enabled ? () => onChanged?.call(null) : null,
                    icon: const Icon(Icons.clear, size: 18, color: AppTheme.gray400),
                  )
                : null,
          ),
          controller: TextEditingController(
            text: value != null
                ? '${value!.hour.toString().padLeft(2, '0')}:${value!.minute.toString().padLeft(2, '0')}'
                : '',
          ),
          style: const TextStyle(
            fontSize: 15,
            color: AppTheme.gray900,
          ),
        ),
      ],
    );
  }

  Future<void> _pickTime(BuildContext context) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: value ?? TimeOfDay.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(primary: AppTheme.primary),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      onChanged?.call(picked);
    }
  }
}
