// lib/widgets/process_steps_indicator.dart
import 'package:flutter/material.dart';

import '../constants.dart';

class ProcessStepsIndicator extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String> stepLabels;

  const ProcessStepsIndicator({
    Key? key,
    required this.currentStep,
    required this.totalSteps,
    required this.stepLabels,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 4, horizontal: 16),
      color: Colors.white,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Dashed line indicators
          Row(
            children: List.generate(totalSteps, (index) {
              // Determine color based on progress
              Color dashColor;
              if (index < currentStep) {
                dashColor = AppColors.success; // Completed steps in green
              } else if (index == currentStep) {
                dashColor = AppColors.primary; // Current step in blue
              } else {
                dashColor = Colors.grey.shade300; // Upcoming steps in gray
              }

              return Expanded(
                child: Container(
                  margin: EdgeInsets.symmetric(horizontal: 2),
                  height: 6,
                  decoration: BoxDecoration(
                    color: dashColor,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              );
            }),
          ),

          SizedBox(height: 4),

          // Step labels
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(totalSteps, (index) {
              // Text style based on current step
              TextStyle textStyle = TextStyle(
                fontSize: 10,
                fontWeight:
                    index == currentStep ? FontWeight.bold : FontWeight.normal,
                color: index == currentStep
                    ? AppColors.primary
                    : (index < currentStep ? Colors.black54 : Colors.grey),
              );

              return Expanded(
                child: Text(
                  stepLabels[index],
                  textAlign: TextAlign.center,
                  style: textStyle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
