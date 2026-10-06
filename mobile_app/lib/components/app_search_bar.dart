import 'dart:async';
import 'package:flutter/material.dart';
import '../config/theme.dart';

class AppSearchBar extends StatefulWidget {
  final String? hint;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final TextEditingController? controller;
  final bool autofocus;
  final Widget? suffix;

  const AppSearchBar({
    super.key,
    this.hint,
    this.onChanged,
    this.onSubmitted,
    this.controller,
    this.autofocus = false,
    this.suffix,
  });

  @override
  State<AppSearchBar> createState() => _AppSearchBarState();
}

class _AppSearchBarState extends State<AppSearchBar> {
  Timer? _debounce;
  final _controller = TextEditingController();
  final _focusNode = FocusNode();

  TextEditingController get _ctrl => widget.controller ?? _controller;

  @override
  void dispose() {
    _debounce?.cancel();
    _focusNode.dispose();
    if (widget.controller == null) _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.gray200),
      ),
      child: Row(
        children: [
          const Padding(
            padding: EdgeInsets.only(left: 12),
            child: Icon(Icons.search, color: AppTheme.gray400, size: 20),
          ),
          Expanded(
            child: TextField(
              controller: _ctrl,
              focusNode: _focusNode,
              autofocus: widget.autofocus,
              onChanged: (value) {
                _debounce?.cancel();
                _debounce = const Duration(milliseconds: 400) as Timer?;
                Future.delayed(const Duration(milliseconds: 400), () {
                  widget.onChanged?.call(value);
                });
              },
              onSubmitted: widget.onSubmitted,
              style: const TextStyle(fontSize: 15, color: AppTheme.gray900),
              decoration: InputDecoration(
                hintText: widget.hint ?? 'Rechercher...',
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                filled: false,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
                hintStyle: const TextStyle(color: AppTheme.gray400),
              ),
            ),
          ),
          if (_ctrl.text.isNotEmpty)
            IconButton(
              onPressed: () {
                _ctrl.clear();
                widget.onChanged?.call('');
                widget.onSubmitted?.call('');
              },
              icon: const Icon(Icons.clear, size: 18, color: AppTheme.gray400),
            ),
          if (widget.suffix != null) widget.suffix!,
        ],
      ),
    );
  }
}
