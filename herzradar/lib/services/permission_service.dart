// lib/services/permission_service.dart
import 'dart:html' as html;

import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  static Future<Map<String, bool>> checkPermissions() async {
    Map<String, bool> permissions = {'camera': false, 'microphone': false};

    if (kIsWeb) {
      // For web, use the navigator API to check permissions status
      try {
        // Check if media devices API is supported
        if (html.window.navigator.mediaDevices != null) {
          // We can only determine if permissions are granted by attempting to access the devices
          // We'll check this without actually showing permission prompts
          final permissionsStatus = await _getWebPermissionsStatus();
          permissions['camera'] = permissionsStatus['camera'] ?? false;
          permissions['microphone'] = permissionsStatus['microphone'] ?? false;
        }
      } catch (e) {
        print("Error checking web permissions: $e");
      }
    } else {
      // For mobile platforms
      permissions['camera'] = await Permission.camera.isGranted;
      permissions['microphone'] = await Permission.microphone.isGranted;
    }

    return permissions;
  }

  // Helper method to check web permissions status without triggering permission prompts
  static Future<Map<String, bool>> _getWebPermissionsStatus() async {
    Map<String, bool> status = {'camera': false, 'microphone': false};

    try {
      // Check if permissions API is available (supported in Chrome, Firefox)
      if (html.window.navigator.permissions != null) {
        try {
          final cameraQuery = await html.window.navigator.permissions
              ?.query({'name': 'camera'});
          status['camera'] = cameraQuery?.state == 'granted';

          final microphoneQuery = await html.window.navigator.permissions
              ?.query({'name': 'microphone'});
          status['microphone'] = microphoneQuery?.state == 'granted';

          return status;
        } catch (e) {
          // Fallback if permissions query fails
          print("Permissions query not supported: $e");
        }
      }

      // If permissions API check failed, we'll have to use device enumeration as a fallback
      // This doesn't trigger permission prompts in most browsers
      final devices =
          await html.window.navigator.mediaDevices?.enumerateDevices();
      if (devices != null) {
        for (var device in devices) {
          if (device.kind == 'videoinput' && device.label.isNotEmpty) {
            status['camera'] = true;
          }
          if (device.kind == 'audioinput' && device.label.isNotEmpty) {
            status['microphone'] = true;
          }
        }
      }
    } catch (e) {
      print("Error getting web permission status: $e");
    }

    return status;
  }

  static Future<bool> requestCameraPermission() async {
    if (kIsWeb) {
      try {
        // For web, requesting means triggering the browser's permission dialog
        final stream = await html.window.navigator.mediaDevices
            ?.getUserMedia({'video': true});

        if (stream != null) {
          // Stop tracks to release the camera
          stream.getTracks().forEach((track) => track.stop());
          return true;
        }
        return false;
      } catch (e) {
        print("Error requesting web camera permission: $e");
        return false;
      }
    } else {
      // For mobile platforms
      final status = await Permission.camera.request();
      return status.isGranted;
    }
  }

  static Future<bool> requestMicrophonePermission() async {
    if (kIsWeb) {
      try {
        // For web, requesting means triggering the browser's permission dialog
        final stream = await html.window.navigator.mediaDevices
            ?.getUserMedia({'audio': true});

        if (stream != null) {
          // Stop tracks to release the microphone
          stream.getTracks().forEach((track) => track.stop());
          return true;
        }
        return false;
      } catch (e) {
        print("Error requesting web microphone permission: $e");
        return false;
      }
    } else {
      // For mobile platforms
      final status = await Permission.microphone.request();
      return status.isGranted;
    }
  }
}
