import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:html' as html;

class PermissionService {
  static Future<Map<String, bool>> checkPermissions() async {
    Map<String, bool> permissions = {
      'camera': false,
      'microphone': false
    };

    if (kIsWeb) {
      // For web, we need to use the navigator API to check permissions
      try {
        // Check if media devices API is supported
        if (html.window.navigator.mediaDevices != null) {
          // Check camera permission
          await html.window.navigator.mediaDevices?.getUserMedia({
            'video': true
          }).then((stream) {
            permissions['camera'] = true;
            // Stop tracks to release the camera
            stream.getTracks().forEach((track) => track.stop());
          }).catchError((e) {
            permissions['camera'] = false;
          });

          // Check microphone permission
          await html.window.navigator.mediaDevices?.getUserMedia({
            'audio': true
          }).then((stream) {
            permissions['microphone'] = true;
            // Stop tracks to release the microphone
            stream.getTracks().forEach((track) => track.stop());
          }).catchError((e) {
            permissions['microphone'] = false;
          });
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

  static Future<bool> requestCameraPermission() async {
    if (kIsWeb) {
      try {
        // For web, requesting means triggering the browser's permission dialog
        await html.window.navigator.mediaDevices?.getUserMedia({
          'video': true
        }).then((stream) {
          // Stop tracks to release the camera
          stream.getTracks().forEach((track) => track.stop());
          return true;
        }).catchError((e) {
          return false;
        });
      } catch (e) {
        print("Error requesting web camera permission: $e");
        return false;
      }
    } else {
      // For mobile platforms
      final status = await Permission.camera.request();
      return status.isGranted;
    }

    // Re-check permissions after request
    final permissions = await checkPermissions();
    return permissions['camera'] ?? false;
  }

  static Future<bool> requestMicrophonePermission() async {
    if (kIsWeb) {
      try {
        // For web, requesting means triggering the browser's permission dialog
        await html.window.navigator.mediaDevices?.getUserMedia({
          'audio': true
        }).then((stream) {
          // Stop tracks to release the microphone
          stream.getTracks().forEach((track) => track.stop());
          return true;
        }).catchError((e) {
          return false;
        });
      } catch (e) {
        print("Error requesting web microphone permission: $e");
        return false;
      }
    } else {
      // For mobile platforms
      final status = await Permission.microphone.request();
      return status.isGranted;
    }

    // Re-check permissions after request
    final permissions = await checkPermissions();
    return permissions['microphone'] ?? false;
  }
}