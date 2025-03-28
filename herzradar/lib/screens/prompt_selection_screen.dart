// lib/screens/prompt_selection_screen.dart
import 'package:flutter/material.dart';

import '../constants.dart';
import '../widgets/process_header_bar.dart';

class PromptSelectionScreen extends StatelessWidget {
  final List<Map<String, String>> prompts = [
    {
      'title': RecordingPrompts.textPassageTitle,
      'text': RecordingPrompts.textPassage
    },
    {'title': 'Gehaltener Vokal', 'text': RecordingPrompts.sustainedVowel},
    {'title': 'Freies Sprechen', 'text': RecordingPrompts.freeSpeech},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          ProcessHeaderBar(
            currentStep: 0,
            totalSteps: 3,
            stepLabels: ['Auswahl', 'Aufnahme', 'Überprüfen'],
            // No onStepTapped needed for first screen
          ),
          Expanded(
            child: SafeArea(
              top: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
                    child: Text(
                      'Sprechübung auswählen',
                      style: AppTextStyles.largeText,
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.all(Dimensions.padding),
                      itemCount: prompts.length,
                      itemBuilder: (context, index) {
                        var prompt = prompts[index];
                        return Card(
                          margin: EdgeInsets.symmetric(vertical: 8),
                          child: ListTile(
                            title: Text(prompt['title']!,
                                style: AppTextStyles.largeText),
                            subtitle: index == 0
                                ? Text("Lesen Sie den Standardtext vor",
                                    style: AppTextStyles.smallText)
                                : Text(
                                    prompt['text']!.length > 70
                                        ? '${prompt['text']!.substring(0, 70)}...'
                                        : prompt['text']!,
                                    style: AppTextStyles.smallText),
                            onTap: () {
                              Navigator.pushNamed(context, '/record',
                                  arguments: prompt);
                            },
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
