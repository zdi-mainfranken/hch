import 'package:flutter/material.dart';

class AppRouteObserver {
  static final RouteObserver<PageRoute> routeObserver =
      RouteObserver<PageRoute>();

  // Define app process flow and route indexes
  static const Map<String, int> routeSteps = {
    '/': 0, // Welcome screen
    '/prompt': 1, // Prompt selection screen
    '/record': 2, // Recording screen
    '/review': 3, // Media review screen
  };

  static const List<String> stepLabels = [
    'Welcome',
    'Select Prompt',
    'Record',
    'Review'
  ];

  static int getCurrentStep(BuildContext context) {
    final String? currentRoute = ModalRoute.of(context)?.settings.name;
    return routeSteps[currentRoute] ?? 0;
  }
}
