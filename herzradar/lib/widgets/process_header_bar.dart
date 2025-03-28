// lib/widgets/process_header_bar.dart
import 'package:flutter/material.dart';

import '../widgets/process_steps_indicator.dart';

class ProcessHeaderBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String> stepLabels;
  final Function(int)? onStepTapped;

  const ProcessHeaderBar({
    Key? key,
    required this.currentStep,
    required this.totalSteps,
    required this.stepLabels,
    this.onStepTapped,
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
            children: [
              // Logo with click functionality and cursor indicator
              MouseRegion(
                cursor: SystemMouseCursors.click,
                child: GestureDetector(
                  onTap: () {
                    // Navigate to start screen, replacing all routes in the stack
                    Navigator.pushNamedAndRemoveUntil(
                        context, '/', (route) => false);
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 16.0),
                    child: Image.asset(
                      'assets/images/herzradar_logov2.png',
                      height: 36,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ),

              // Process steps indicator takes remaining space
              Expanded(
                child: ProcessStepsIndicator(
                  currentStep: currentStep,
                  totalSteps: totalSteps,
                  stepLabels: stepLabels,
                  onStepTapped: onStepTapped ??
                      (int stepIndex) {
                        // Default navigation logic
                        if (stepIndex < currentStep) {
                          switch (stepIndex) {
                            case 0: // Select Prompt
                              Navigator.popUntil(
                                  context, ModalRoute.withName('/prompt'));
                              break;
                            case 1: // Record
                              if (ModalRoute.of(context)?.settings.name ==
                                  '/review') {
                                Navigator.pop(context);
                              }
                              break;
                          }
                        }
                      },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
