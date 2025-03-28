// lib/widgets/process_header_bar.dart
import 'package:flutter/material.dart';

import '../constants.dart';
import 'process_steps_indicator.dart';

class ProcessHeaderBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String> stepLabels;
  final bool showBackButton;
  final VoidCallback? onBackPressed;

  const ProcessHeaderBar({
    Key? key,
    required this.currentStep,
    required this.totalSteps,
    required this.stepLabels,
    this.showBackButton = true,
    this.onBackPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: SafeArea(
        bottom: false,
        child: Container(
          height: 56, // Standard app bar height
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Back button with white background and blue arrow
              if (showBackButton)
                Container(
                  color: Colors.white, // Changed to white background
                  width: 56, // Square button area
                  height: 56,
                  child: Center(
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      icon: Icon(
                        Icons.arrow_back,
                        color: AppColors.primary, // Changed to primary color
                      ),
                      onPressed:
                          onBackPressed ?? () => Navigator.of(context).pop(),
                    ),
                  ),
                ),

              // Process Steps Indicator (fills remaining space)
              Expanded(
                child: ProcessStepsIndicator(
                  currentStep: currentStep,
                  totalSteps: totalSteps,
                  stepLabels: stepLabels,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
