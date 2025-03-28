// lib/widgets/process_steps_indicator.dart
import 'package:flutter/material.dart';

import '../constants.dart';

class ProcessStepsIndicator extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String> stepLabels;
  final Function(int)? onStepTapped;

  const ProcessStepsIndicator({
    Key? key,
    required this.currentStep,
    required this.totalSteps,
    required this.stepLabels,
    this.onStepTapped,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      color: Colors.white,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Progress indicators with interactive behavior
          Row(
            children: List.generate(totalSteps, (index) {
              // Determine color based on progress
              Color dashColor;
              bool isCompletedStep = index < currentStep;

              if (isCompletedStep) {
                dashColor = AppColors.success; // Completed steps in green
              } else if (index == currentStep) {
                dashColor = AppColors.primary; // Current step in blue
              } else {
                dashColor = Colors.grey.shade300; // Upcoming steps in gray
              }

              return Expanded(
                child: MouseRegion(
                  cursor: isCompletedStep
                      ? SystemMouseCursors.click
                      : SystemMouseCursors.basic,
                  child: GestureDetector(
                    // Only allow tapping on completed steps
                    onTap: isCompletedStep && onStepTapped != null
                        ? () => onStepTapped!(index)
                        : null,
                    child: Container(
                      margin: EdgeInsets.symmetric(horizontal: 2),
                      height: 8, // Slightly taller for better touch target
                      decoration: BoxDecoration(
                        color: dashColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),

          SizedBox(height: 8),

          // Step labels
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(totalSteps, (index) {
              // Text style based on current step
              bool isCompletedStep = index < currentStep;

              TextStyle textStyle = TextStyle(
                fontSize: 12,
                fontWeight:
                    index == currentStep ? FontWeight.bold : FontWeight.normal,
                color: index == currentStep
                    ? AppColors.primary
                    : (isCompletedStep ? Colors.black54 : Colors.grey),
              );

              return Expanded(
                child: MouseRegion(
                  cursor: isCompletedStep
                      ? SystemMouseCursors.click
                      : SystemMouseCursors.basic,
                  child: GestureDetector(
                    // Only allow tapping on completed steps
                    onTap: isCompletedStep && onStepTapped != null
                        ? () => onStepTapped!(index)
                        : null,
                    child: Text(
                      stepLabels[index],
                      textAlign: TextAlign.center,
                      style: textStyle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
