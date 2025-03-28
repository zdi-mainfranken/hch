// lib/screens/media_review_screen.dart
import 'dart:io';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../constants.dart';
import '../services/camera_service.dart';
import '../widgets/large_button.dart';
import '../widgets/process_header_bar.dart';

class MediaReviewScreen extends StatefulWidget {
  @override
  _MediaReviewScreenState createState() => _MediaReviewScreenState();
}

class _MediaReviewScreenState extends State<MediaReviewScreen> {
  bool isLoading = true;
  bool hasError = false;
  String errorMessage = '';
  CameraService? cameraService;

  // Audio player
  final AudioPlayer audioPlayer = AudioPlayer();
  bool isPlaying = false;
  Duration audioDuration = Duration.zero;
  Duration audioPosition = Duration.zero;

  @override
  void initState() {
    super.initState();

    // Set up audio player listeners
    audioPlayer.onDurationChanged.listen((newDuration) {
      if (mounted) {
        print('Debug: onDurationChanged fired with duration: $newDuration');
        setState(() {
          audioDuration = newDuration;
        });
      }
    });

    audioPlayer.onPositionChanged.listen((newPosition) {
      if (mounted) {
        setState(() {
          audioPosition = newPosition;
        });
      }
    });

    audioPlayer.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() {
          isPlaying = state == PlayerState.playing;
        });
      }
    });

    audioPlayer.onPlayerComplete.listen((_) {
      if (mounted) {
        setState(() {
          isPlaying = false;
          audioPosition = Duration.zero;
        });
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _initializeFromArguments();
  }

  Future<void> _initializeFromArguments() async {
    final args = ModalRoute.of(context)!.settings.arguments;

    if (args == null) {
      _setError('Keine Mediendaten vorhanden');
      return;
    }

    try {
      if (args is CameraService) {
        cameraService = args;

        if (cameraService?.capturedImage == null) {
          _setError('Kein Bild verfügbar');
          return;
        }

        if (cameraService?.recordedAudio == null) {
          _setError('Keine Audioaufnahme verfügbar');
          return;
        }

        await _initializeAudioPlayer();

        setState(() {
          isLoading = false;
        });
      } else {
        _setError('Nicht unterstützter Argumenttyp: ${args.runtimeType}');
      }
    } catch (e) {
      _setError('Fehler bei der Initialisierung der Überprüfung: $e');
    }
  }

  Future<void> _initializeAudioPlayer() async {
    try {
      if (cameraService?.recordedAudio != null) {
        final audioPath = cameraService!.recordedAudio!.path;
        print('Debug: Trying to load audio from: $audioPath');

        await audioPlayer.stop();

        if (kIsWeb) {
          await audioPlayer.setSourceUrl(audioPath);
          await audioPlayer.setVolume(0);
          await audioPlayer.resume();
          await Future.delayed(Duration(milliseconds: 500));
          await audioPlayer.pause();
          await audioPlayer.setVolume(1);
          await audioPlayer.seek(Duration.zero);
        } else {
          await audioPlayer.setSourceDeviceFile(audioPath);
        }

        await Future.delayed(Duration(milliseconds: 500));
        print(
            "Audio player initialized, duration: ${audioDuration.inMilliseconds}ms");
      }
    } catch (e) {
      print("Error initializing audio player: $e");
      _setError('Audioplayer konnte nicht initialisiert werden: $e');
    }
  }

  void _togglePlayPause() async {
    if (isPlaying) {
      await audioPlayer.pause();
    } else {
      await audioPlayer.resume();
    }
  }

  void _seekAudio(double value) async {
    if (audioDuration.inMilliseconds > 0) {
      final newPosition = Duration(milliseconds: value.toInt());
      await audioPlayer.seek(newPosition);
    }
  }

  void _setError(String message) {
    print('REVIEW ERROR: $message');
    if (mounted) {
      setState(() {
        hasError = true;
        errorMessage = message;
        isLoading = false;
      });
    }
  }

  void _saveMedia() {
    if (kIsWeb && cameraService != null) {
      cameraService!.saveMediaToDownloads();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Bild und Audio gespeichert'),
          duration: Duration(seconds: 3),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Speicherfunktion für diese Plattform nicht verfügbar'),
        ),
      );
    }
  }

  @override
  void dispose() {
    audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Combined header component
          ProcessHeaderBar(
            currentStep: 2,
            totalSteps: 3,
            stepLabels: ['Auswahl', 'Aufnahme', 'Überprüfen'],
            onStepTapped: (index) {
              if (index < 2) {
                // Navigate based on tapped step
                if (index == 0) {
                  Navigator.popUntil(context, ModalRoute.withName('/prompt'));
                } else if (index == 1) {
                  Navigator.pop(context);
                }
              }
            },
          ),

          Expanded(
            child: isLoading
                ? _buildLoadingView()
                : hasError
                    ? _buildErrorView()
                    : _buildReviewContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 16),
          Text('Medien werden geladen...'),
        ],
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: AppColors.error),
            SizedBox(height: 16),
            Text(
              'Fehler',
              style: AppTextStyles.largeText.copyWith(color: AppColors.error),
            ),
            SizedBox(height: 8),
            Text(
              errorMessage,
              textAlign: TextAlign.center,
              style: AppTextStyles.normalText,
            ),
            SizedBox(height: 24),
            LargeButton(
              text: 'Zurück',
              width: 150.0,
              onPressed: () {
                Navigator.popUntil(context, ModalRoute.withName('/prompt'));
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewContent() {
    final capturedImage = cameraService?.capturedImage;

    // Calculate slider values safely
    final double sliderMax = audioDuration.inMilliseconds > 0
        ? audioDuration.inMilliseconds.toDouble()
        : 1.0;

    final double sliderValue =
        audioPosition.inMilliseconds.toDouble().clamp(0, sliderMax);

    return SafeArea(
      top: false,
      child: SingleChildScrollView(
        child: Column(
          children: [
            // Screen title
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Aufnahme überprüfen',
                  style: AppTextStyles.largeText,
                ),
              ),
            ),

            // Image section
            Container(
              height: 250,
              width: double.infinity,
              margin: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: capturedImage != null
                  ? kIsWeb
                      ? Image.network(
                          capturedImage.path,
                          fit: BoxFit.contain,
                        )
                      : Image.file(
                          File(capturedImage.path),
                          fit: BoxFit.contain,
                        )
                  : Center(child: Text('Kein Bild verfügbar')),
            ),

            // Audio section and action buttons
            Container(
              margin: EdgeInsets.symmetric(horizontal: 16),
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_formatDuration(audioPosition)),
                      Expanded(
                        child: Slider(
                          value: sliderValue,
                          min: 0,
                          max: sliderMax,
                          activeColor: AppColors.primary,
                          onChanged: audioDuration.inMilliseconds > 0
                              ? _seekAudio
                              : null,
                        ),
                      ),
                      Text(_formatDuration(audioDuration)),
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        icon: Icon(Icons.replay_10),
                        onPressed: audioDuration.inMilliseconds > 0
                            ? () {
                                final newPosition = Duration(
                                  milliseconds: (audioPosition.inMilliseconds -
                                          10000)
                                      .clamp(0, audioDuration.inMilliseconds),
                                );
                                audioPlayer.seek(newPosition);
                              }
                            : null,
                      ),
                      FloatingActionButton(
                        onPressed: () {
                          _togglePlayPause();
                        },
                        child: Icon(
                          isPlaying ? Icons.pause : Icons.play_arrow,
                        ),
                        backgroundColor: audioDuration.inMilliseconds > 0
                            ? AppColors.primary
                            : Colors.grey,
                      ),
                      IconButton(
                        icon: Icon(Icons.forward_10),
                        onPressed: audioDuration.inMilliseconds > 0
                            ? () {
                                final newPosition = Duration(
                                  milliseconds: (audioPosition.inMilliseconds +
                                          10000)
                                      .clamp(0, audioDuration.inMilliseconds),
                                );
                                audioPlayer.seek(newPosition);
                              }
                            : null,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            SizedBox(height: 24),

            // Action buttons
            Padding(
              padding: const EdgeInsets.all(Dimensions.padding),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  // Calculate button width based on available space
                  // Allow 16.0 pixels spacing between buttons
                  final buttonSpacing = 16.0;
                  final availableWidth = constraints.maxWidth;
                  final buttonCount = 3;

                  // Check if we have enough space for side-by-side layout
                  // Each button needs at least 120px width to be readable
                  final minButtonWidth = 120.0;
                  final isHorizontalLayout = availableWidth >=
                      (minButtonWidth * buttonCount +
                          buttonSpacing * (buttonCount - 1));

                  // Button width calculation
                  final buttonWidth = isHorizontalLayout
                      ? (availableWidth - (buttonSpacing * (buttonCount - 1))) /
                          buttonCount
                      : double.infinity;

                  final buttons = [
                    LargeButton(
                      text: 'Speichern',
                      icon: Icons.save,
                      width: buttonWidth,
                      onPressed: _saveMedia,
                    ),
                    LargeButton(
                      text: 'Wiederholen',
                      // Changed from "Neu starten" to be more concise
                      icon: Icons.replay,
                      buttonColor: Colors.orange,
                      width: buttonWidth,
                      onPressed: () {
                        Navigator.popUntil(
                            context, ModalRoute.withName('/prompt'));
                      },
                    ),
                    LargeButton(
                      text: 'Senden',
                      icon: Icons.check_circle,
                      buttonColor: Colors.green,
                      width: buttonWidth,
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                              content: Text('Aufnahme erfolgreich gesendet!')),
                        );
                        Future.delayed(Duration(seconds: 1), () {
                          Navigator.popUntil(context, ModalRoute.withName('/'));
                        });
                      },
                    ),
                  ];

                  // Return either a Row or Column based on available space
                  if (isHorizontalLayout) {
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: buttons,
                    );
                  } else {
                    return Column(
                      children: [
                        buttons[0],
                        SizedBox(height: buttonSpacing),
                        buttons[1],
                        SizedBox(height: buttonSpacing),
                        buttons[2],
                      ],
                    );
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes.toString().padLeft(2, '0');
    final seconds = (duration.inSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }
}
