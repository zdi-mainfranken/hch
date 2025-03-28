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
  String statusMessage = 'Kamera wird gestartet...';
  XFile? capturedImage;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    setState(() {
      statusMessage = 'Kamera wird gestartet...';
    });

    try {
      await cameraService.initializeCamera();
      setState(() {
        isCameraReady = true;
        statusMessage = 'Positionieren Sie Ihr Gesicht im Rahmen';
      });

      _simulateFaceDetection();
    } catch (e) {
      setState(() {
        statusMessage = 'Kamera konnte nicht initialisiert werden: $e';
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
          statusMessage =
              'Gesicht erkannt! Sie können nun mit der Aufnahme beginnen.';
        });
      }
    });
  }

  Future<void> _capturePhotoAndPrepareRecording() async {
    if (!isFaceAligned) {
      _showErrorSnackBar('Bitte positionieren Sie Ihr Gesicht richtig');
      return;
    }

    setState(() {
      isProcessing = true;
      statusMessage = 'Foto wird aufgenommen...';
    });

    try {
      final photo = await cameraService.takePhoto();
      if (photo != null) {
        setState(() {
          capturedImage = photo;
          isPhotoTaken = true;
          isPhotoMode = false;
          isProcessing = false;
          statusMessage = 'Bitte lesen Sie den Text laut vor.';
        });
      } else {
        _showErrorSnackBar('Foto konnte nicht aufgenommen werden');
        setState(() {
          isProcessing = false;
          statusMessage =
              'Foto konnte nicht aufgenommen werden. Bitte versuchen Sie es erneut.';
        });
      }
    } catch (e) {
      _showErrorSnackBar('Fehler bei der Fotoaufnahme: $e');
      setState(() {
        isProcessing = false;
        statusMessage = 'Fehler: $e';
      });
    }
  }

  Future<void> _startAudioRecording() async {
    setState(() {
      isProcessing = true;
      statusMessage = 'Audioaufnahme wird gestartet...';
    });

    try {
      final success = await cameraService.startAudioRecording();
      if (success) {
        setState(() {
          isAudioRecording = true;
          isProcessing = false;
          audioRecordingDuration = 0;
          statusMessage = 'Aufnahme läuft... Bitte lesen Sie den Text vor.';
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
        _showErrorSnackBar('Audioaufnahme konnte nicht gestartet werden');
        setState(() {
          isProcessing = false;
          statusMessage =
              'Aufnahme konnte nicht gestartet werden. Bitte versuchen Sie es erneut.';
        });
      }
    } catch (e) {
      _showErrorSnackBar('Fehler beim Starten der Aufnahme: $e');
      setState(() {
        isProcessing = false;
        statusMessage = 'Fehler: $e';
      });
    }
  }

  Future<void> _stopAudioRecording() async {
    recordingTimer?.cancel();

    setState(() {
      isProcessing = true;
      statusMessage = 'Aufnahme wird verarbeitet...';
    });

    try {
      final audioFile = await cameraService.stopAudioRecording();

      setState(() {
        isAudioRecording = false;
        isProcessing = false;
        statusMessage = 'Aufnahme abgeschlossen';
      });

      if (audioFile != null) {
        Navigator.pushNamed(context, '/review', arguments: cameraService);
      } else {
        _showErrorSnackBar('Audioaufnahme konnte nicht verarbeitet werden');
      }
    } catch (e) {
      _showErrorSnackBar('Fehler beim Stoppen der Aufnahme: $e');
      setState(() {
        isAudioRecording = false;
        isProcessing = false;
        statusMessage = 'Fehler: $e';
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
    prompt = args ?? {'title': 'Übung', 'text': 'Standard-Übung'};

    return Scaffold(
      body: Column(
        children: [
          // Updated header with navigation logic
          ProcessHeaderBar(
            currentStep: 1,
            totalSteps: 3,
            stepLabels: ['Auswahl', 'Aufnahme', 'Überprüfen'],
            onStepTapped: (index) {
              if (index == 0) {
                // Handle potential state cleanup before navigation
                if (isAudioRecording) {
                  _stopAudioRecording();
                }
                Navigator.pop(context);
              }
            },
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
        color: Colors.black,
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
                              'Aufnahme',
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
              text: 'Aufnahme starten',
              onPressed:
                  isFaceAligned ? _capturePhotoAndPrepareRecording : null,
            ),
          if (!isPhotoMode && !isProcessing)
            LargeButton(
              text: isAudioRecording ? 'Aufnahme beenden' : 'Aufnahme starten',
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
