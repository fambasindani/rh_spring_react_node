import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../config/theme.dart';

class AppSkeleton extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;
  final bool isCircle;

  const AppSkeleton({
    super.key,
    this.width = double.infinity,
    this.height = 16,
    this.borderRadius = 8,
    this.isCircle = false,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppTheme.gray200,
      highlightColor: AppTheme.gray100,
      child: isCircle
          ? Container(
              width: width,
              height: height,
              decoration: const BoxDecoration(
                color: AppTheme.gray200,
                shape: BoxShape.circle,
              ),
            )
          : Container(
              width: width,
              height: height,
              decoration: BoxDecoration(
                color: AppTheme.gray200,
                borderRadius: BorderRadius.circular(borderRadius),
              ),
            ),
    );
  }
}

class TableSkeleton extends StatelessWidget {
  final int rows;
  final int columns;

  const TableSkeleton({super.key, this.rows = 5, this.columns = 4});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: const BoxDecoration(
            color: AppTheme.gray50,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(12),
              topRight: Radius.circular(12),
            ),
          ),
          child: Row(
            children: List.generate(
              columns,
              (i) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: AppSkeleton(height: 14, width: 80),
                ),
              ),
            ),
          ),
        ),
        ...List.generate(rows, (_) => _buildRow()),
      ],
    );
  }

  Widget _buildRow() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.gray100)),
      ),
      child: Row(
        children: List.generate(
          columns,
          (i) => Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: AppSkeleton(
                height: 14,
                width: i == 0 ? 30 : 80,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class CardSkeleton extends StatelessWidget {
  const CardSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.gray200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppSkeleton(height: 20, width: 120),
          const SizedBox(height: 12),
          AppSkeleton(height: 32, width: 80),
          const SizedBox(height: 8),
          AppSkeleton(height: 14, width: 160),
        ],
      ),
    );
  }
}

class ListSkeleton extends StatelessWidget {
  final int items;

  const ListSkeleton({super.key, this.items = 5});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(items, (_) => _buildItem()),
    );
  }

  Widget _buildItem() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.gray100)),
      ),
      child: Row(
        children: [
          const AppSkeleton(width: 40, height: 40, isCircle: true),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppSkeleton(height: 14, width: 140),
                const SizedBox(height: 6),
                AppSkeleton(height: 12, width: 100),
              ],
            ),
          ),
          AppSkeleton(width: 60, height: 24, borderRadius: 12),
        ],
      ),
    );
  }
}

class DashboardSkeleton extends StatelessWidget {
  const DashboardSkeleton();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: List.generate(
              3,
              (_) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: const CardSkeleton(),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const CardSkeleton(),
          const SizedBox(height: 16),
          const CardSkeleton(),
        ],
      ),
    );
  }
}
