import 'package:flutter/material.dart';

import '../constants.dart';

class PromptDisplay extends StatelessWidget {
  final String promptText;

  const PromptDisplay({Key? key, required this.promptText}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Dimensions.padding),
      child: Text(
        promptText,
        style: AppTextStyles.normalText,
        textAlign: TextAlign.center,
      ),
    );
  }
}
