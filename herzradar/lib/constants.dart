import 'package:flutter/material.dart';

class AppColors {
  static const primary =
      Color(0xFF1DAEE5); // Blue - for buttons, app bar, progress bars
  static const logoColor =
      Color(0xFFE42723); // Red - only for logo and branding
  static const background = Colors.white; // White - main background color
  static const success = Colors.green; // Green - for granted permissions
  static const error = Colors.red; // Standard red for errors
  static const warning = Colors.orange; // Standard orange for warnings
}

class AppTextStyles {
  static const largeText = TextStyle(fontSize: 24, fontWeight: FontWeight.bold);
  static const normalText = TextStyle(fontSize: 18);
  static const smallText = TextStyle(fontSize: 14, color: Colors.grey);
}

class Dimensions {
  static const buttonHeight = 60.0;
  static const padding = 16.0;
}

// Recording prompt options remain unchanged
class RecordingPrompts {
  static const textPassageTitle = "Nordwind und Sonne";
  static const textPassage =
      "Einst stritten sich Nordwind und Sonne, wer von ihnen beiden wohl der Stärkere wäre, "
      "als ein Wanderer, der in einen warmen Mantel gehüllt war, des Weges daherkam. "
      "Sie wurden einig, dass derjenige für den Stärkeren gelten sollte, der den Wanderer zwingen würde, "
      "seinen Mantel abzunehmen. Der Nordwind blies mit aller Macht, aber je mehr er blies, "
      "desto fester hüllte sich der Wanderer in seinen Mantel ein. Endlich gab der Nordwind den Kampf auf. "
      "Nun erwärmte die Sonne die Luft mit ihren freundlichen Strahlen, und schon nach wenigen Augenblicken "
      "zog der Wanderer seinen Mantel aus. Da musste der Nordwind zugeben, dass die Sonne von ihnen beiden der Stärkere war.";

  static const sustainedVowel =
      "Bitte halten Sie den Laut 'Ah' so lange wie möglich.";
  static const freeSpeech = "Bitte erzählen Sie, wie Sie sich heute fühlen.";
}
