// lib/screens/recording_screen.dart
import 'dart:async';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';

import '../constants.dart';
import '../services/camera_service.dart';
import '../widgets/camera_preview_widget.dart';
import '../widgets/face_positioning_overlay.dart';
import '../widgets/large_button.dart';
import '../widgets/process_header_bar.dart';

class RecordingScreen extends StatefulWidget {
  @override
  _RecordingScreenState createState() => _RecordingScreenState();
}

class _RecordingScreenState extends State<RecordingScreen> {
  late Map<String, String> prompt;

  // State flags
  bool isCameraReady = false;
  bool isPhotoMode = true;
  bool isFaceAligned = false;
  bool isPhotoTaken = false;
  bool isAudioRecording = false;
  bool isProcessing = false;

  // Timers
  int audioRecordingDuration = 0;
  Timer? recordingTimer;
  Timer? faceDetectionTimer;

  // Services
  CameraService cameraService = CameraService();
  String statusMessage = 'Initializing camera...';
  XFile? capturedImage;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  // Camera initialization and other methods remain unchanged...
  // [All other methods remain the same as your original implementation]

  Future<void> _initCamera() async {
    setState(() {
      statusMessage = 'Initializing camera...';
    });

    try {
      await cameraService.initializeCamera();
      setState(() {
        isCameraReady = true;
        statusMessage = 'Position your face in the outline';
      });

      _simulateFaceDetection();
    } catch (e) {
      setState(() {
        statusMessage = 'Failed to initialize camera: $e';
      });
      print("Error initializing camera: $e");
    }
  }

  void _simulateFaceDetection() {
    faceDetectionTimer?.cancel();
    faceDetectionTimer = Timer(Duration(seconds: 5), () {
      if (mounted && isPhotoMode && !isPhotoTaken) {
        setState(() {
          isFaceAligned = true;
          statusMessage = 'Face aligned! You can now start recording.';
        });
      }
    });
  }

  Future<void> _capturePhotoAndPrepareRecording() async {
    if (!isFaceAligned) {
      _showErrorSnackBar('Please position your face properly first');
      return;
    }

    setState(() {
      isProcessing = true;
      statusMessage = 'Taking photo...';
    });

    try {
      final photo = await cameraService.takePhoto();
      if (photo != null) {
        setState(() {
          capturedImage = photo;
          isPhotoTaken = true;
          isPhotoMode = false;
          isProcessing = false;
          statusMessage = 'Please read the text aloud.';
        });
      } else {
        _showErrorSnackBar('Failed to take photo');
        setState(() {
          isProcessing = false;
          statusMessage = 'Failed to take photo. Please try again.';
        });
      }
    } catch (e) {
      _showErrorSnackBar('Error taking photo: $e');
      setState(() {
        isProcessing = false;
        statusMessage = 'Error: $e';
      });
    }
  }

  Future<void> _startAudioRecording() async {
    // Same implementation as before
    setState(() {
      isProcessing = true;
      statusMessage = 'Starting audio recording...';
    });

    try {
      final success = await cameraService.startAudioRecording();
      if (success) {
        setState(() {
          isAudioRecording = true;
          isProcessing = false;
          audioRecordingDuration = 0;
          statusMessage = 'Recording audio... Please read the text.';
        });

        recordingTimer = Timer.periodic(Duration(seconds: 1), (timer) {
          setState(() {
            audioRecordingDuration++;
          });
        });

        Future.delayed(Duration(seconds: 30), () {
          if (mounted && isAudioRecording) {
            _stopAudioRecording();
          }
        });
      } else {
        _showErrorSnackBar('Failed to start audio recording');
        setState(() {
          isProcessing = false;
          statusMessage = 'Failed to start recording. Please try again.';
        });
      }
    } catch (e) {
      _showErrorSnackBar('Error starting recording: $e');
      setState(() {
        isProcessing = false;
        statusMessage = 'Error: $e';
      });
    }
  }

  Future<void> _stopAudioRecording() async {
    // Same implementation as before
    recordingTimer?.cancel();

    setState(() {
      isProcessing = true;
      statusMessage = 'Processing recording...';
    });

    try {
      final audioFile = await cameraService.stopAudioRecording();

      setState(() {
        isAudioRecording = false;
        isProcessing = false;
        statusMessage = 'Recording completed';
      });

      if (audioFile != null) {
        Navigator.pushNamed(context, '/review', arguments: cameraService);
      } else {
        _showErrorSnackBar('Failed to process audio recording');
      }
    } catch (e) {
      _showErrorSnackBar('Error stopping recording: $e');
      setState(() {
        isAudioRecording = false;
        isProcessing = false;
        statusMessage = 'Error: $e';
      });
    }
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  void dispose() {
    recordingTimer?.cancel();
    faceDetectionTimer?.cancel();
    cameraService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, String>?;
    prompt = args ?? {'title': 'Prompt', 'text': 'Default prompt'};

    return Scaffold(
      body: Column(
        children: [
          // Process header bar with updated steps
          ProcessHeaderBar(
            currentStep: 1,
            // Now second step (was 2)
            totalSteps: 3,
            // Now 3 steps total (was 4)
            stepLabels: ['Select Prompt', 'Record', 'Review'],
            // Removed 'Welcome'
            showBackButton: true,
          ),

          Expanded(
            child: _buildMainContent(),
          ),
          _buildBottomSection(),
        ],
      ),
    );
  }

  Widget _buildMainContent() {
    if (!isCameraReady) {
      return Center(child: Text(statusMessage));
    }

    if (isPhotoMode) {
      // Camera view with face positioning overlay - now maximized
      return Container(
        width: double.infinity,
        height: double.infinity,
        color: Colors.black, // Changed to black for better visual integration
        child: Stack(
          children: [
            // Camera preview in maximized container
            Positioned.fill(
              child: CameraPreviewWidget(cameraService: cameraService),
            ),

            // Face positioning overlay
            Positioned.fill(
              child: FacePositioningOverlay(isAligned: isFaceAligned),
            ),

            // Loading indicator
            if (isProcessing)
              Center(
                child: Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(color: Colors.white),
                      SizedBox(height: 16),
                      Text(
                        statusMessage,
                        style: TextStyle(color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      );
    } else {
      // Audio recording mode - show only the text
      return Container(
        color: Colors.white,
        child: Column(
          children: [
            // Text prompt section
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Container(
                    padding: EdgeInsets.all(20),
                    width: double.infinity,
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            prompt['title']!,
                            style: AppTextStyles.largeText,
                            textAlign: TextAlign.center,
                          ),
                          Divider(height: 32),
                          Text(
                            prompt['text']!,
                            style: AppTextStyles.normalText,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Recording progress indicator
            if (isAudioRecording)
              Container(
                width: double.infinity,
                margin: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Column(
                  children: [
                    // Recording progress bar
                    LinearProgressIndicator(
                      value: audioRecordingDuration / 30, // 30 seconds max
                      backgroundColor: Colors.grey.shade300,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                    SizedBox(height: 8),
                    // Time indicator
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.mic, color: AppColors.primary, size: 16),
                            SizedBox(width: 4),
                            Text(
                              'Recording',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          _formatDuration(audioRecordingDuration),
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
          ],
        ),
      );
    }
  }

  Widget _buildBottomSection() {
    return Padding(
      padding: const EdgeInsets.all(Dimensions.padding),
      child: Column(
        children: [
          if (isPhotoMode && !isProcessing)
            LargeButton(
              text: 'Start Recording',
              onPressed:
                  isFaceAligned ? _capturePhotoAndPrepareRecording : null,
            ),
          if (!isPhotoMode && !isProcessing)
            LargeButton(
              text: isAudioRecording ? 'Stop Recording' : 'Start Recording',
              onPressed:
                  isAudioRecording ? _stopAudioRecording : _startAudioRecording,
            ),
          SizedBox(height: 8),
          Text(
            statusMessage,
            style: TextStyle(fontSize: 14, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  String _formatDuration(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }
}
