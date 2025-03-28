// lib/screens/welcome_screen.dart
import 'package:flutter/material.dart';

import '../constants.dart';
import '../services/permission_service.dart';
import '../widgets/large_button.dart';

class WelcomeScreen extends StatefulWidget {
  @override
  _WelcomeScreenState createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  Map<String, bool> permissions = {'camera': false, 'microphone': false};
  bool isCheckingPermission = false;

  @override
  void initState() {
    super.initState();
    _checkPermissionsQuietly();
  }

  Future<void> _checkPermissionsQuietly() async {
    final perms = await PermissionService.checkPermissions();
    if (mounted) {
      setState(() {
        permissions = perms;
      });
    }
  }

  Future<void> _requestPermission(String permissionType) async {
    setState(() {
      isCheckingPermission = true;
    });

    bool granted = false;
    if (permissionType == 'camera') {
      granted = await PermissionService.requestCameraPermission();
    } else if (permissionType == 'microphone') {
      granted = await PermissionService.requestMicrophonePermission();
    }

    if (mounted) {
      setState(() {
        permissions[permissionType] = granted;
        isCheckingPermission = false;
      });
    }
  }

  bool get allPermissionsGranted =>
      permissions['camera'] == true && permissions['microphone'] == true;

  @override
  Widget build(BuildContext context) {
    // Get screen dimensions for more responsive layout
    final size = MediaQuery.of(context).size;
    final smallScreen = size.height < 600; // Adjust threshold as needed

    return Scaffold(
      backgroundColor: AppColors.background,
      // No process steps indicator on welcome screen
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(Dimensions.padding),
          child: Column(
            children: [
              // Adjust top spacing based on screen size
              SizedBox(height: smallScreen ? 40 : 60),

              // Logo with responsive sizing
              Container(
                width: smallScreen ? 80 : 120,
                height: smallScreen ? 80 : 120,
                child: Image.asset(
                  'assets/images/herzradar_logov2.png',
                  fit: BoxFit.contain,
                ),
              ),

              SizedBox(height: smallScreen ? 16 : 24),

              // App title
              Text(
                'HerzRadar',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: smallScreen ? 28 : 32,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: 16),

              // App description
              Text(
                'Monitor your heart health through voice analysis',
                style: TextStyle(
                  color: Colors.black87,
                  fontSize: smallScreen ? 16 : 18,
                ),
                textAlign: TextAlign.center,
              ),

              // Flexible spacing that adapts to screen size
              SizedBox(height: smallScreen ? 20 : 40),

              // Permission icons in a row
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildPermissionIcon(
                    'Camera',
                    Icons.camera_alt,
                    permissions['camera'] ?? false,
                    () => _requestPermission('camera'),
                    smallScreen,
                  ),
                  SizedBox(width: smallScreen ? 20 : 40),
                  _buildPermissionIcon(
                    'Microphone',
                    Icons.mic,
                    permissions['microphone'] ?? false,
                    () => _requestPermission('microphone'),
                    smallScreen,
                  ),
                ],
              ),

              SizedBox(height: 24),

              // Permission status message
              Text(
                allPermissionsGranted
                    ? 'All permissions granted'
                    : 'Tap the icons above to grant permissions',
                style: TextStyle(
                  color: Colors.black54,
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: 24),

              // Get started button
              LargeButton(
                text: 'Get Started',
                onPressed: allPermissionsGranted
                    ? () => Navigator.pushNamed(context, '/prompt')
                    : null,
              ),

              // Permission check indicator
              if (isCheckingPermission)
                Padding(
                  padding: const EdgeInsets.only(top: 16.0),
                  child: CircularProgressIndicator(
                    valueColor:
                        AlwaysStoppedAnimation<Color>(AppColors.primary),
                  ),
                ),

              // Bottom padding to ensure content is visible
              SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPermissionIcon(String name, IconData icon, bool isGranted,
      VoidCallback onTap, bool smallScreen) {
    // Adjust size based on screen size
    final iconSize = smallScreen ? 60.0 : 80.0;

    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(iconSize / 2),
          child: Container(
            width: iconSize,
            height: iconSize,
            decoration: BoxDecoration(
              color: isGranted
                  ? AppColors.success
                  : AppColors.primary.withOpacity(0.7),
              shape: BoxShape.circle,
            ),
            child: Stack(
              children: [
                Center(
                  child: Icon(
                    icon,
                    size: smallScreen ? 30 : 40,
                    color: Colors.white,
                  ),
                ),
                if (!isGranted)
                  Positioned(
                    right: 10,
                    bottom: 10,
                    child: Icon(
                      Icons.add_circle,
                      color: Colors.white,
                      size: smallScreen ? 18 : 24,
                    ),
                  ),
              ],
            ),
          ),
        ),
        SizedBox(height: 8),
        Text(
          name,
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.bold,
            fontSize: smallScreen ? 13 : 14,
          ),
        ),
        Text(
          isGranted ? 'Granted' : 'Tap to enable',
          style: TextStyle(
            color: Colors.black54,
            fontSize: smallScreen ? 10 : 12,
          ),
        ),
      ],
    );
  }
}
