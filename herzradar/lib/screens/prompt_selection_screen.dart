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
    {'title': 'Sustained Vowel', 'text': RecordingPrompts.sustainedVowel},
    {'title': 'Free Speech', 'text': RecordingPrompts.freeSpeech},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Combined header component with updated steps
          ProcessHeaderBar(
            currentStep: 0,
            // Now first step (was 1)
            totalSteps: 3,
            // Now 3 steps total (was 4)
            stepLabels: ['Select Prompt', 'Record', 'Review'],
            // Removed 'Welcome'
            showBackButton: true,
          ),

          Expanded(
            child: SafeArea(
              top: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                    child: Text(
                      'Select a Prompt',
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
                                ? Text("Read a standard text passage aloud",
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
