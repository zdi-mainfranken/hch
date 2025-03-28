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
    if (kIsWeb) {
      // On web, we don't need to use permission_handler
      // Browser will show permission dialog automatically
    } else {
      // Request camera and microphone permissions for mobile
      await Permission.camera.request();
      await Permission.microphone.request();
    }

    // Get available cameras
    final cameras = await availableCameras();
    if (cameras.isEmpty) {
      print("No cameras available");
      return;
    }

    // Choose the front camera if available, otherwise use the first camera
    final frontCamera = cameras.firstWhere(
      (camera) => camera.lensDirection == CameraLensDirection.front,
      orElse: () => cameras.first,
    );

    // Set different resolution based on platform
    final resolutionPreset = kIsWeb
        ? ResolutionPreset
            .medium // Medium for web to ensure better compatibility
        : ResolutionPreset.high; // Higher resolution for mobile devices

    controller = CameraController(
      frontCamera,
      resolutionPreset,
      enableAudio: false, // Audio not needed for photo mode
      imageFormatGroup:
          ImageFormatGroup.jpeg, // Force JPEG for consistent results
    );

    try {
      await controller!.initialize();

      // Set specific camera settings for better face capture
      if (controller!.value.isInitialized) {
        // Lock exposure, focus, etc. for optimal face capture
        if (!kIsWeb) {
          // These may not be fully supported on web, so wrap in try/catch
          try {
            await controller!.setFocusMode(FocusMode.auto);
            await controller!.setExposureMode(ExposureMode.auto);
          } catch (e) {
            print("Warning: Could not set camera modes: $e");
          }
        }
      }

      Wakelock.enable(); // prevent screen timeout during recording
    } catch (e) {
      print("Error initializing camera: $e");
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
        numChannels: 1
      );
      audioMimeType = "audio/webm";

      isRecording = true;
      print("Audio recording started");
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
