import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';
import 'package:herzradar/screens/media_review_screen.dart';
import 'package:herzradar/screens/prompt_selection_screen.dart';
import 'package:herzradar/screens/recording_screen.dart';

import 'constants.dart';
import 'screens/welcome_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Configure for web if running on web platform
  if (kIsWeb) {
    setUrlStrategy(PathUrlStrategy());
  } else {
    // Lock orientation to portrait mode (not applicable for web)
    await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  runApp(HeartTrackApp());
}

class HeartTrackApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'HerzRadar',
      theme: ThemeData(
        primaryColor: AppColors.primary,
        colorScheme: ColorScheme.light(
          primary: AppColors.primary,
          secondary: AppColors.primary,
          background: AppColors.background,
          error: AppColors.error,
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.primary,
          elevation: 0,
          iconTheme: IconThemeData(color: Colors.white),
        ),
        textTheme: TextTheme(
          bodyLarge: AppTextStyles.normalText,
          bodyMedium: AppTextStyles.normalText,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
          ),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => WelcomeScreen(),
        '/prompt': (context) => PromptSelectionScreen(),
        '/record': (context) => RecordingScreen(),
        '/review': (context) => MediaReviewScreen(),
      },
    );
  }
}
