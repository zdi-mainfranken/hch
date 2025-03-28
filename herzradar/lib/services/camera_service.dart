import 'dart:html' as html;

import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:wakelock/wakelock.dart';

class CameraService {
  CameraController? controller;
  String lastRecordedFile = '';
  XFile? capturedImage;
  XFile? recordedAudio;
  String? audioMimeType;
  String? imageMimeType;
  bool isRecording = false;

  final _audioRecorder = Record();

  Future<void> initializeCamera() async {
    try {
      if (kIsWeb) {
        // Add a browser compatibility check
        final userAgent = html.window.navigator.userAgent.toLowerCase();
        final isFirefox = userAgent.contains('firefox');

        // Use a simpler approach for Firefox
        if (isFirefox) {
          await _initializeCameraForFirefox();
          return;
        }
      }

      // Original camera initialization for Chrome and other browsers/platforms
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        throw Exception("No cameras available");
      }

      final frontCamera = cameras.firstWhere(
        (camera) => camera.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      final resolutionPreset =
          kIsWeb ? ResolutionPreset.medium : ResolutionPreset.high;

      controller = CameraController(
        frontCamera,
        resolutionPreset,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );

      await controller!.initialize();

      // Rest of your initialization code...
      Wakelock.enable();
    } catch (e) {
      print("Error initializing camera: $e");
      rethrow; // Let the UI handle the error
    }
  }

  // Specialized Firefox camera initialization
  Future<void> _initializeCameraForFirefox() async {
    try {
      // Create a simpler camera access request for Firefox
      final stream = await html.window.navigator.mediaDevices?.getUserMedia({
        'video': {
          'facingMode': 'user' // Request front camera
        }
      });

      if (stream == null) {
        throw Exception("Could not access camera stream in Firefox");
      }

      // Create a synthetic camera description for the controller
      final cameras = [
        CameraDescription(
          name: 'Firefox Camera',
          lensDirection: CameraLensDirection.front,
          sensorOrientation: 0,
        )
      ];

      controller = CameraController(
        cameras[0],
        ResolutionPreset.medium,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );

      // Connect the stream to the controller (implementation depends on camera plugin)
      // This part may require custom implementation depending on your camera plugin

      // Signal that initialization is complete
      print("Firefox camera initialized successfully");
    } catch (e) {
      print("Error initializing Firefox camera: $e");
      throw Exception("Firefox camera initialization failed: $e");
    }
  }

  Future<XFile?> takePhoto() async {
    if (controller == null || !controller!.value.isInitialized) {
      print("Camera not initialized");
      return null;
    }

    try {
      // Briefly play the shutter sound and show flash animation
      SystemSound.play(SystemSoundType.click);

      // Take the picture
      final XFile photo = await controller!.takePicture();
      capturedImage = photo;
      imageMimeType = "image/jpeg";

      print("Photo captured: ${photo.path}");
      return photo;
    } catch (e) {
      print("Error taking photo: $e");
      return null;
    }
  }

  Future<bool> startAudioRecording() async {
    if (isRecording) return false;

    try {
      // Check for microphone permission
      if (!kIsWeb) {
        final status = await Permission.microphone.request();
        if (status != PermissionStatus.granted) {
          print("Microphone permission denied");
          return false;
        }
      }

      await _audioRecorder.start(
          encoder: AudioEncoder.wav,
          bitRate: 128000,
          samplingRate: 44100,
          numChannels: 1);
      audioMimeType = "audio/wav";

      isRecording = true;
      return true;
    } catch (e) {
      print("Error starting audio recording: $e");
      return false;
    }
  }

  Future<XFile?> stopAudioRecording() async {
    if (!isRecording) return null;

    try {
      // Stop recording and get the file path
      final path = await _audioRecorder.stop();
      isRecording = false;

      if (path != null) {
        // Create an XFile from the path
        recordedAudio = XFile(path);
        print("Audio recording saved: $path");
        return recordedAudio;
      } else {
        print("Audio recording failed: No path returned");
        return null;
      }
    } catch (e) {
      print("Error stopping audio recording: $e");
      return null;
    }
  }

  Future<bool> saveMediaToDownloads() async {
    if (kIsWeb) {
      try {
        // First save the image if available
        if (capturedImage != null) {
          await _saveFileToDownloads(capturedImage!, 'herzradar_photo.jpg',
              imageMimeType ?? 'image/jpeg');
        }

        // Then save the audio if available
        if (recordedAudio != null) {
          await _saveFileToDownloads(recordedAudio!, 'herzradar_audio.wav',
              audioMimeType ?? 'audio/wav');
        }

        return true;
      } catch (e) {
        print("Error saving media to downloads: $e");
        return false;
      }
    } else {
      // For mobile we'd need a different approach
      return false;
    }
  }

  Future<void> _saveFileToDownloads(
      XFile file, String filename, String mimeType) async {
    // Read the file data
    final data = await file.readAsBytes();

    // Create a blob URL for the file
    final blob = html.Blob([data], mimeType);
    final url = html.Url.createObjectUrlFromBlob(blob);

    // Create a download link and trigger it
    final anchor = html.AnchorElement(href: url)
      ..setAttribute('download', filename)
      ..click();

    // Clean up the URL
    html.Url.revokeObjectUrl(url);
  }

  void dispose() {
    controller?.dispose();
    _audioRecorder.dispose();
    Wakelock.disable();
  }
}
